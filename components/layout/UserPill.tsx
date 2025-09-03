"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Settings, User as UserIcon } from "lucide-react";
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

  const initials = React.useMemo(() => {
    const n = (name || "").trim();
    if (!n && email) return email.charAt(0).toUpperCase();
    const parts = n.split(/\s+/);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    const two = (a + b).toUpperCase();
    return two || "U";
  }, [name, email]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setOpen(false);
    try {
      const supabase = supabaseBrowser();

      // Run both in parallel to cut perceived delay
      await Promise.allSettled([
        supabase.auth.signOut({ scope: "global" }),
        fetch("/auth/callback/signout", {
          method: "POST",
          credentials: "include",
        }),
      ]);

      // Refresh any server-rendered bits and send to login
      router.refresh();
      router.replace("/login");
    } catch {
      // Even on error, try to refresh to reflect best-known state
      router.refresh();
      router.replace("/login");
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
          {avatarUrl ? (
            <AvatarImage
              src={avatarUrl}
              alt={name || "User avatar"}
              referrerPolicy="no-referrer"
            />
          ) : (
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          )}
        </Avatar>
        <span className="hidden sm:inline-block max-w-[140px] truncate" title={name}>
          {name}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate" title={name}>
          {name}
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
        <DropdownMenuItem onClick={() => go("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
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
