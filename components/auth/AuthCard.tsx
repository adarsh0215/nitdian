"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export default function AuthCard({
  title,
  subtitle,
  children,
  className,
}: React.PropsWithChildren<{ title: string; subtitle?: string; className?: string }>) {
  return (
    <div className="min-h-[100svh] grid place-items-center px-4">
      <div
        className={cn(
          "w-full max-w-md rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
          "p-6 sm:p-8",
          className
        )}
      >
        <header className="mb-6 sm:mb-8 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </header>

        {children}
      </div>
    </div>
  );
}
