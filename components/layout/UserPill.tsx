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
        keepalive: true,
      } as RequestInit & { keepalive: boolean }); // 👈 safe cast to support keepalive
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
      const lastUserId = localStorage.getItem("auth:last_seen_user_id");
      const lastUserEmail = localStorage.getItem("last_user_email");

      const eventId = makeEventId();
      const payload = {
        user_id: lastUserId ?? null,
        user_email: lastUserEmail ?? null,
        action: "sign_out",
        event_id: eventId,
      };

      try {
        localStorage.setItem(
          "auth:last_logged",
          JSON.stringify({ user_id: lastUserId ?? null, action: "sign_out", ts: Date.now(), event_id: eventId })
        );
      } catch {
        // ignore storage errors
      }

      console.info("UserPill: sending sign_out log", { user_id: lastUserId, event_id: eventId });

      try {
        await sendSignOutPayload(payload);
      } catch (err) {
        console.warn("Sign-out logging attempt failed:", err);
      }

      // supabaseBrowser might be a factory or a client instance
      type SupabaseClientShape = { auth?: { signOut?: (opts?: { scope?: string }) => Promise<unknown> } };
      type SupabaseFactory = () => SupabaseClientShape | undefined;

      const supabaseClient: SupabaseClientShape | undefined = (() => {
        try {
          if (typeof supabaseBrowser === "function") {
            return (supabaseBrowser as SupabaseFactory)();
          }
          return supabaseBrowser as SupabaseClientShape | undefined;
        } catch {
          return undefined;
        }
      })();

      try {
        await supabaseClient?.auth?.signOut?.({ scope: "local" });
      } catch (err) {
        console.warn("local signOut failed:", err);
      }

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

      window.location.replace("/login");
    } catch (err) {
      console.error("Sign out failed, redirecting anyway:", err);
      try {
        window.location.replace("/login");
      } catch {
        // final fallback
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
