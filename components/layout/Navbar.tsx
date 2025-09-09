// components/layout/Navbar.tsx
// "use client" - this component runs on the client because it uses hooks and browser-only APIs
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import UserPill, { type UserPillData } from "@/components/layout/UserPill";
import { supabaseBrowser } from "@/lib/supabase/client";
import type {
  AuthChangeEvent,
  Session,
  User,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

// Constant list of navigation links used in both desktop and mobile nav
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Directory", href: "/directory" },
  { label: "Dashboard", href: "/dashboard" },
] as const;

// Lightweight typed wrapper for profile metadata we expect to display
type ProfileMeta = { full_name?: string; avatar_url?: string; };

// Safely extract profile metadata from unknown `meta` (defensive checks)
function getProfileMeta(meta: unknown): ProfileMeta {
  if (meta && typeof meta === "object") {
    const m = meta as Record<string, unknown>;
    return {
      full_name: typeof m.full_name === "string" ? m.full_name : undefined,
      avatar_url: typeof m.avatar_url === "string" ? m.avatar_url : undefined,
    };
  }
  return {};
}

// Prefer generated DB type if you have it — this is a simple local type for the "profiles" row
type ProfileRow = { id: string; full_name: string | null; avatar_url: string | null; email: string | null; };
// Type guard to validate unknown payloads coming from realtime/postgres changes
function isProfileRow(v: unknown): v is ProfileRow { return !!v && typeof v === "object" && "id" in v; }

// Navbar component — receives an optional `initialPill` which may be seeded from server-side render
export default function Navbar({ initialPill = null }: { initialPill?: UserPillData | null }) {
  // Router/path utilities
  const pathname = usePathname();
  const router = useRouter();

  // Single supabase client instance memoized for the component lifecycle
  const supabase = React.useMemo(() => supabaseBrowser(), []);

  // Local UI state
  const [open, setOpen] = React.useState(false); // mobile menu open state

  // `pill` holds the small user profile shown in the header (name, email, avatar)
  // seeded from server when available for instant UI; can be updated client-side
  const [pill, setPill] = React.useState<UserPillData | null>(initialPill);

  // Tracks whether we are currently resolving the user's auth/profile state
  const [loadingUser, setLoadingUser] = React.useState(initialPill === null);

  // `seeded` indicates whether we received server-side seed data already
  // prevents unnecessary fetches and visual flicker
  const seeded = React.useRef<boolean>(initialPill !== null);

  // Convert a Supabase `User` into the `UserPillData` shape used by UserPill
  const pillFromUser = React.useCallback((user: User): UserPillData => {
    const { full_name, avatar_url } = getProfileMeta(user.user_metadata);
    const name = full_name ?? user.email?.split("@")[0] ?? "Member"; // fallback name
    const email = user.email ?? "";
    const avatarUrl = avatar_url ?? null;
    return { name, email, avatarUrl };
  }, []);

  // If we have an authenticated userId, hydrate the pill from the `profiles` table.
  // This enriches the pill using DB data (server may not have included those fields).
  const hydrateFromProfile = React.useCallback(async (userId: string | null) => {
    if (!userId) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, email")
      .eq("id", userId)
      .maybeSingle();
    if (profile) {
      // merge DB profile with existing pill state while keeping fallbacks
      setPill((prev) => ({
        name: profile.full_name || prev?.name || "Member",
        email: profile.email || prev?.email || "",
        avatarUrl: profile.avatar_url || prev?.avatarUrl || null,
      }));
    }
  }, [supabase]);

  // Utility to set the UI state from a Supabase session object
  const setFromSession = React.useCallback((session: Session | null) => {
    const user = session?.user ?? null;
    if (user) {
      // derive a quick pill for instant display
      setPill(pillFromUser(user));
      setLoadingUser(false);
      seeded.current = true; // mark as seeded so we don't re-fetch unnecessarily
      void hydrateFromProfile(user.id); // also attempt to hydrate from DB in background
    }
  }, [pillFromUser, hydrateFromProfile]);


  // Main effect: responsible for wiring auth state, quick seeding, realtime subscription,
  // visibility handling, and cleanup. Kept as a single effect to centralize lifecycle.
  React.useEffect(() => {
    let cancelled = false; // local cancellation flag to avoid state updates after unmount

    // Subscribe to supabase auth state changes
    const { data: authSub } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (cancelled) return;

        // Common signed-in / token-refresh events: update UI and refresh page routing
        if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
          setFromSession(session);
          setLoadingUser(false);
          router.refresh(); // refresh Next.js cache/data that depends on auth state
          return;
        }
        // Signed out: clear UI and refresh
        if (event === "SIGNED_OUT") {
          seeded.current = true; // we explicitly know there is no user now
          setPill(null);
          setLoadingUser(false);
          router.refresh();
          return;
        }
        // Initial session delivered by the client lib
        if (event === "INITIAL_SESSION" && session?.user) {
          setFromSession(session);
          setLoadingUser(false);
        }
      }
    );

    // Quick seed from the browser client if server-side seed wasn't present.
    // This avoids flicker when initialPill is not provided by the server.
    (async () => {
      if (seeded.current) return; // if already seeded, skip
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (data.user) {
        setPill(pillFromUser(data.user));
        setLoadingUser(false);
        seeded.current = true;
        void hydrateFromProfile(data.user.id);
      }
    })();

    // Fallback: if seeding hasn't completed within 1200ms, stop showing "loading".
    // This prevents the header from being stuck in a loading state forever.
    const fallback = setTimeout(() => {
      if (!seeded.current && !cancelled) {
        setPill(null);
        setLoadingUser(false);
      }
    }, 1200);

    // Realtime subscription to the current user's `profiles` row so changes (name/avatar)
    // update the UI immediately without a page refresh.
    let profileChannel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const me = data.user;
      if (!me || cancelled) return;

      // Create a channel listening to updates on `profiles` for the current user
      profileChannel = supabase
        .channel("profiles:me")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${me.id}` },
          (payload: RealtimePostgresChangesPayload<ProfileRow>) => {
            const next = payload.new;
            if (!isProfileRow(next)) return; // defensive check
            // Merge the updated profile values into the pill state
            setPill((prev) => ({
              name: next.full_name ?? prev?.name ?? "Member",
              email: next.email ?? prev?.email ?? "",
              avatarUrl: next.avatar_url ?? prev?.avatarUrl ?? null,
            }));
          }
        )
        .subscribe();
    })();

    // Listen for an application-level custom event `profile:updated` which other
    // parts of your app can dispatch to proactively update the header without
    // touching Supabase (useful on profile edit pages).
    type ProfileUpdatedDetail = Partial<UserPillData>;
    const onProfileUpdated = (e: Event) => {
      const ce = e as CustomEvent<ProfileUpdatedDetail>;
      const detail = ce.detail ?? {};
      setPill((prev) => ({
        name: detail.name ?? prev?.name ?? "Member",
        email: detail.email ?? prev?.email ?? "",
        avatarUrl: detail.avatarUrl ?? prev?.avatarUrl ?? null,
      }));
    };
    window.addEventListener("profile:updated", onProfileUpdated);

    // When the document becomes visible, attempt a quick seed if we haven't already.
    // This helps in scenarios where the tab was inactive during auth completion.
    const onVis = async () => {
      if (document.visibilityState !== "visible" || seeded.current) return;
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setPill(pillFromUser(data.user));
        setLoadingUser(false);
        seeded.current = true;
        void hydrateFromProfile(data.user.id);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    // Cleanup on unmount: cancel timers, subscriptions, and event listeners
    return () => {
      cancelled = true;
      clearTimeout(fallback);
      window.removeEventListener("profile:updated", onProfileUpdated);
      document.removeEventListener("visibilitychange", onVis);
      authSub.subscription.unsubscribe();
      if (profileChannel) supabase.removeChannel(profileChannel);
    };
  }, [supabase, pillFromUser, setFromSession, hydrateFromProfile, router]);

  // If we are on the coming-soon page, hide the navbar (keeps the page focused)
  if (pathname === "/coming-soon" ) {
    return null
  };

  // --- Render ---
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" aria-label="NIT Durgapur" className="flex items-center gap-2 md:justify-self-start">
          {/* Use Image component for automatic image optimization */}
          <Image src="/images/logo.svg" alt="Logo" width={44} height={44} className="h-12 w-12 object-contain rounded-md bg-transparent dark:bg-white p-1" />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="truncate text-base font-semibold tracking-tight">NIT Durgapur</span>
            <span className="truncate font-bold text-xs sm:text-sm text-muted-foreground">International Alumni Network</span>
          </div>
        </Link>

        {/* Desktop nav: shown on md+ screens */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href; // mark active link for styling
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "text-sm transition-colors hover:text-foreground ",
                  active ? "text-foreground font-bold " : "text-muted-foreground font-bold ",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right controls: theme toggle, user pill or auth buttons, and mobile menu button */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {loadingUser ? (
            // Skeleton while user state is resolving
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : pill ? (
            // When signed in, render the UserPill component
            <UserPill key={pill.email || pill.name} {...pill} />
          ) : (
            // When not signed in, show signup/login buttons (desktop)
            <div className="hidden md:flex items-center gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
              <Button size="sm" onClick={() => router.push("/login")}>
                Login
              </Button>
            </div>
          )}
          {/* Mobile menu toggle (visible < md) */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile sheet (only rendered when `open` is true) */}
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col space-y-1 px-4 py-3">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground",
                    active ? "text-foreground font-medium" : "text-muted-foreground",
                  ].join(" ")}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            {pill ? (
              // When signed in, show the small signed-in text with email
              <div className="pt-2 text-xs text-muted-foreground">Signed in as {pill.email}</div>
            ) : (
              // When not signed in, show signup/login buttons in mobile sheet
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href="/signup" onClick={() => setOpen(false)}>Sign up</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}