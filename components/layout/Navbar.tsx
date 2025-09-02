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

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Directory", href: "/directory" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [pill, setPill] = React.useState<UserPillData | null>(null);

  // helper to fetch pill data
  const fetchUser = React.useCallback(async () => {
    try {
      const supabase = supabaseBrowser();
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user ?? null;

      if (!user) {
        setPill(null);
        setLoadingUser(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, email")
        .eq("id", user.id)
        .single();

      const name =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Member";
      const email = profile?.email || user.email || "";
      const avatarUrl =
        profile?.avatar_url || user.user_metadata?.avatar_url || null;

      setPill({ name, email, avatarUrl });
      setLoadingUser(false);
    } catch {
      setPill(null);
      setLoadingUser(false);
    }
  }, []);

  // Load on mount + re-run on auth state change
  React.useEffect(() => {
    const supabase = supabaseBrowser();

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
      router.refresh(); // make sure server comps re-render if needed
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser, router]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <Link
        href="/"
        aria-label="NIT Durgapur"
        className="flex items-center gap-2 md:justify-self-start"
      >
        <Image
          src= "/images/logo.png"
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
                  active
                    ? "text-foreground font-medium"
                    : "text-muted-foreground",
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
            <Button size="sm" onClick={() => router.push("/login")}>
              Login
            </Button>
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
                    active
                      ? "text-foreground font-medium"
                      : "text-muted-foreground",
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
              <Button size="sm" className="mt-2 w-full" asChild>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Login
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
