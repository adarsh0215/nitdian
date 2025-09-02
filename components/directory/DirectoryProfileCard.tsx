"use client";

import * as React from "react";
import { Briefcase, MapPin } from "lucide-react";
import type { DirectoryItem } from "./DirectoryClient";

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

type Props = {
  profile: DirectoryItem;
  layout: "grid" | "list";
};

function Avatar({
  name,
  src,
  size = 48,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
}) {
  const initial = (name?.trim()?.[0] || "A").toUpperCase();
  const dim = `${size}px`;
  return (
    <div
      className="relative shrink-0 rounded-full ring-2 ring-background"
      style={{ width: dim, height: dim }}
      aria-hidden
    >
      {src ? (
        <img
          src={src}
          alt={name ?? "Avatar"}
          className="h-full w-full rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="grid h-full w-full place-items-center rounded-full bg-gradient-to-br from-teal-500/20 to-indigo-500/20 text-teal-700 dark:text-teal-300 font-semibold">
          {initial}
        </div>
      )}
    </div>
  );
}

export default function DirectoryProfileCard({ profile: p, layout }: Props) {
  const degree = p.degree ?? "";
  const year = p.graduation_year;
  const branchFull = p.branch ?? "";
  const loc = [p.city, p.country].filter(Boolean).join(", ");

  return (
    <article
      className={cn(
        "group rounded-2xl border bg-card/60",
        // keep hover if you like the subtle affordance; remove to be 100% static
        "p-4 sm:p-5 transition-colors hover:bg-accent/30 hover:shadow-sm",
        layout === "grid" ? "h-full" : "w-full"
      )}
    >
      <div className={cn("flex gap-4", layout === "list" ? "items-center" : "items-start")}>
        <Avatar name={p.full_name} src={p.avatar_url} size={48} />

        <div className="min-w-0 flex-1 space-y-2">
          {/* Name */}
          <h3
            className="truncate text-lg font-semibold tracking-tight"
            title={p.full_name ?? ""}
          >
            {p.full_name ?? "Unnamed"}
          </h3>

          {/* Role @ Company */}
          {(p.designation || p.company) && (
            <div className="flex items-start gap-2">
              <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p
                className="min-w-0 truncate text-[15px]"
                title={`${p.designation ?? ""}${p.company ? ` @ ${p.company}` : ""}`}
              >
                {p.designation ? <span className="font-medium">{p.designation}</span> : null}
                {p.designation && p.company ? " @ " : ""}
                {p.company}
              </p>
            </div>
          )}

          {/* Degree + Year (year never truncates) */}
          {(degree || year) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {degree ? (
                <span className="truncate" title={degree}>
                  {degree}
                </span>
              ) : null}
              {year ? (
                <span
                  className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground/80"
                  title={`Batch ${year}`}
                >
                  {year}
                </span>
              ) : null}
            </div>
          )}

          {/* Branch — full, wraps as needed */}
          {branchFull && (
            <p
              className="text-sm text-muted-foreground whitespace-normal break-words"
              title={branchFull}
            >
              {branchFull}
            </p>
          )}

          {/* Location */}
          {loc && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="truncate" title={loc}>
                {loc}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
