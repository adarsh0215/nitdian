// components/layout/UserPill.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabaseBrowser } from "@/lib/supabase/client";

export type UserPillData = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

export default function UserPill({ name, email, avatarUrl }: UserPillData) {
  const router = useRouter();
  const [signingOut, setSigningOut] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [imgErr, setImgErr] = React.useState(false);

  const initials = React.useMemo(() => {
    const n = (name || "").trim();
    if (!n && email) return email.charAt(0).toUpperCase();
    const parts = n.split(/\s+/);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    const two = (a + b).toUpperCase();
    return two || "U";
  }, [name, email]);

  React.useEffect(() => setImgErr(false), [avatarUrl]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  // generate small event id (uses crypto.randomUUID when available)
  function makeEventId() {
    try {
      const g = globalThis as typeof globalThis & { crypto?: Crypto };
      if (g.crypto?.randomUUID) {
        return g.crypto.randomUUID();
      }
    } catch {
      // ignore
    }
    return "evt_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
  }

  // Helper: try sendBeacon then fallback to keepalive fetch
  async function sendSignOutPayload(payload: Record<string, unknown>) {
    const path = "/api/log-event";
    const url =
      typeof window !== "undefined" && window.location?.origin ? `${window.location.origin}${path}` : path;
    const bodyStr = JSON.stringify(payload);

    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([bodyStr], { type: "application/json" });
        const ok = navigator.sendBeacon(url, blob);
        if (ok) return true; // queued by browser
      }
    } catch {
      // swallow and fall back
    }

    try {
      // keepalive allows the request to continue while the page unloads
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyStr,
        // @ts-ignore: keepalive is supported in browsers; TS may complain in some environments
        keepalive: true,
      });
      return true;
    } catch {
      return false;
    }
  }

  const onSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setOpen(false);

    try {
      // Read last-known user info saved by AuthWatcher
      const lastUserId = (() => {
        try {
          return localStorage.getItem("auth:last_seen_user_id");
        } catch {
          return null;
        }
      })();
      const lastUserEmail = (() => {
        try {
          return localStorage.getItem("last_user_email");
        } catch {
          return null;
        }
      })();

      // generate event id and include it in the payload & local marker
      const eventId = makeEventId();
      const payload = {
        user_id: lastUserId ?? null,
        user_email: lastUserEmail ?? null,
        action: "sign_out",
        event_id: eventId,
      };

      // MARK: set auth:last_logged so AuthWatcher dedupe will skip the follow-up SIGNED_OUT post
      try {
        localStorage.setItem(
          "auth:last_logged",
          JSON.stringify({ user_id: lastUserId ?? null, action: "sign_out", ts: Date.now(), event_id: eventId })
        );
      } catch {
        // ignore storage errors
      }

      // Debug: small console info so you can trace duplicates (remove in prod if desired)
      console.info("UserPill: sending sign_out log", { user_id: lastUserId, event_id: eventId });

      // Try to enqueue sign-out log before actually signing out
      try {
        await sendSignOutPayload(payload);
      } catch (err) {
        // log and continue
        console.warn("Sign-out logging attempt failed:", err);
      }

      // Now proceed with sign-out steps (preserve your previous behavior)
      // supabaseBrowser might be exported as a function (factory) or a client instance; handle both safely

      // Precise local types describing what we need
      type SupabaseClientShape = { auth?: { signOut?: (opts?: { scope?: string }) => Promise<unknown> } };
      type SupabaseFactory = () => SupabaseClientShape | undefined;

      const supabaseClient = (() => {
        try {
          const sb = supabaseBrowser as unknown;
          if (typeof sb === "function") {
            const fn = sb as SupabaseFactory;
            return fn();
          }
          return sb as SupabaseClientShape | undefined;
        } catch {
          return undefined;
        }
      })();

      // 1) Clear local client session immediately so UI flips
      try {
        await supabaseClient?.auth?.signOut?.({ scope: "local" });
      } catch (err) {
        console.warn("local signOut failed:", err);
      }

      // 2) Clear server cookies (and optionally revoke tokens)
      try {
        await Promise.allSettled([
          supabaseClient?.auth?.signOut?.({ scope: "global" }),
          fetch("/auth/callback/signout", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
          }),
        ]);
      } catch (err) {
        console.warn("global signOut or server callback failed:", err);
      }

      // 3) HARD redirect to avoid App Router/RSC caching quirks
      window.location.replace("/login");
    } catch (err) {
      console.error("Sign out failed, redirecting anyway:", err);
      try {
        window.location.replace("/login");
      } catch {
        // final fallback: do nothing
      }
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 text-sm hover:bg-muted transition-colors disabled:opacity-60"
        disabled={signingOut}
        aria-busy={signingOut || undefined}
        aria-label={signingOut ? "Signing out" : `User menu for ${name || email}`}
      >
        <Avatar className="h-7 w-7">
          {avatarUrl && !imgErr ? (
            <AvatarImage
              src={avatarUrl}
              alt={name || "User avatar"}
              referrerPolicy="no-referrer"
              onError={() => setImgErr(true)}
            />
          ) : (
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          )}
        </Avatar>
        <span className="hidden sm:inline-block max-w-[140px] truncate" title={name || email}>
          {name || email}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate" title={name || "Member"}>
          {name || "Member"}
        </DropdownMenuLabel>
        <div className="px-2 pb-2 text-xs text-muted-foreground truncate" title={email}>
          {email}
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => go("/dashboard")}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("/profile")}>
          <UserIcon className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} disabled={signingOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
