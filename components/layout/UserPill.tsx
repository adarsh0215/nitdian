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

  const initials = React.useMemo(() => {
    const parts = (name || "").trim().split(/\s+/);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase() || (email?.[0]?.toUpperCase() ?? "U");
  }, [name, email]);

  const onSignOut = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 text-sm hover:bg-muted transition-colors">
        <Avatar className="h-7 w-7">
          {!!avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline-block max-w-[140px] truncate">{name}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
        <div className="px-2 pb-2 text-xs text-muted-foreground truncate">{email}</div>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <UserIcon className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
