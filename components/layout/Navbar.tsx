// components/layout/Navbar.tsx
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
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Directory", href: "/directory" },
  { label: "Dashboard", href: "/dashboard" },
];

type ProfileMeta = {
  full_name?: string;
  avatar_url?: string;
};

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

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = React.useMemo(() => supabaseBrowser(), []);
  const [open, setOpen] = React.useState(false);

  // Important: start "loading" and don't show logged-out UI until we know for sure
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [pill, setPill] = React.useState<UserPillData | null>(null);

  const pillFromUser = React.useCallback((user: User): UserPillData => {
    const { full_name, avatar_url } = getProfileMeta(user.user_metadata);
    const name = full_name ?? user.email?.split("@")[0] ?? "Member";
    const email = user.email ?? "";
    const avatarUrl = avatar_url ?? null;
    return { name, email, avatarUrl };
  }, []);

  const hydrateFromProfile = React.useCallback(
    async (userId: string | null) => {
      if (!userId) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, email")
        .eq("id", userId)
        .maybeSingle();

      if (profile) {
        setPill((prev) => ({
          name: profile.full_name || prev?.name || "Member",
          email: profile.email || prev?.email || "",
          avatarUrl: profile.avatar_url || prev?.avatarUrl || null,
        }));
      }
    },
    [supabase]
  );

  React.useEffect(() => {
    let cancelled = false;
    let gotInitialEvent = false;

    // 1) Subscribe to auth changes (fires very early with INITIAL_SESSION)
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (cancelled) return;

        if (event === "INITIAL_SESSION") gotInitialEvent = true;

        const user = session?.user ?? null;
        if (user) {
          setPill(pillFromUser(user));
          setLoadingUser(false);
          // hydrate friendly name/avatar from profiles (async)
          hydrateFromProfile(user.id);
        } else {
          // Only mark logged out after we KNOW initial session is resolved
          if (event === "SIGNED_OUT" || event === "INITIAL_SESSION") {
            setPill(null);
            setLoadingUser(false);
          }
        }

        // Refresh server components if they depend on auth cookies
        router.refresh();
      }
    );

    // 2) Seed quickly from local (no network)
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;
      if (user) {
        setPill(pillFromUser(user));
        setLoadingUser(false);
        hydrateFromProfile(user.id);
      }
    })();

    // 3) Fallback if INITIAL_SESSION never arrives
    const fallback = setTimeout(() => {
      if (!gotInitialEvent && !cancelled) {
        setLoadingUser(false);
      }
    }, 1200);

    // 4) Instant profile updates right after onboarding save
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

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      window.removeEventListener("profile:updated", onProfileUpdated);
      sub.subscription.unsubscribe();
    };
  }, [supabase, pillFromUser, hydrateFromProfile, router]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          aria-label="NIT Durgapur"
          className="flex items-center gap-2 md:justify-self-start"
        >
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain rounded-lg hairline bg-surface"
          />
          <div className="hidden sm:flex flex-col leading-tight min-w-0">
            <span className="truncate text-base font-semibold tracking-tight">
              NIT Durgapur
            </span>
            <span className="truncate text-xs sm:text-sm text-muted-foreground">
              International Alumni Network
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "text-sm transition-colors hover:text-foreground",
                  active ? "text-foreground font-medium" : "text-muted-foreground",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />

          {loadingUser ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : pill ? (
            <UserPill {...pill} />
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
              <Button size="sm" onClick={() => router.push("/login")}>
                Login
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
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
              <div className="pt-2 text-xs text-muted-foreground">
                Signed in as {pill.email}
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    Sign up
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
