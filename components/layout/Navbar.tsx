// components/layout/Navbar.tsx
// Client shell: logo, nav links, theme switcher, mobile menu.
// Session-aware UI comes in server-rendered via the `userSlot` prop (see NavbarUser).
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ThemeSwitcher from "@/components/ui/theme-switcher";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Directory", href: "/directory" },
  { label: "Dashboard", href: "/dashboard" },
] as const;

export default function Navbar({ userSlot }: { userSlot: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Coming-soon page renders without chrome
  if (pathname === "/coming-soon") return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" aria-label="NIT Durgapur" className="flex items-center gap-2 md:justify-self-start">
          <Image src="/images/logo.svg" alt="Logo" width={44} height={44} className="h-12 w-12 object-contain rounded-md bg-transparent dark:bg-white p-1" />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="truncate text-base font-semibold tracking-tight">NIT Durgapur</span>
            <span className="truncate font-bold text-xs sm:text-sm text-muted-foreground">International Alumni Network</span>
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
                  "text-sm transition-colors hover:text-foreground ",
                  active ? "text-foreground font-bold " : "text-muted-foreground font-bold ",
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
          {userSlot}
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
          </nav>
        </div>
      )}
    </header>
  );
}
