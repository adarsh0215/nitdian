"use client";

import * as React from "react";
import Image from "next/image";

import type { DirectoryItem } from "./DirectoryClient";

const cn = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

function Avatar({
  name,
  src,
  size = 56,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
}) {
  const initial = (name?.trim()?.[0] || "A").toUpperCase();
  return (
    <div
      className="relative shrink-0 rounded-full ring-2 ring-background overflow-hidden"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? "Avatar"}
          width={size}
          height={size}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center rounded-full bg-gradient-to-br from-teal-500/20 to-indigo-500/20 text-teal-700 dark:text-teal-300 font-semibold">
          {initial}
        </div>
      )}
    </div>
  );
}

export default function DirectoryProfileCard({
  profile,
  layout,
}: {
  profile: DirectoryItem;
  layout: "grid" | "list";
}) {
  const name = profile.full_name ?? "Alumni";
  const headline =
    profile.designation && profile.company
      ? `${profile.designation} @ ${profile.company}`
      : profile.designation ?? profile.company ?? "";

  const second = [
    profile.degree && `• ${profile.degree}`,
    profile.branch && `• ${profile.branch}`,
    profile.graduation_year && `• ${profile.graduation_year}`,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/^•\s/, ""); // clean leading bullet

  const location =
    profile.city && profile.country
      ? `${profile.city}, ${profile.country}`
      : profile.city || profile.country || "";

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card/50 p-4 shadow-sm hover:shadow transition",
        layout === "list" && "sm:flex sm:items-start sm:gap-4"
      )}
      aria-label={name}
    >
      <div className="flex items-start gap-4">
        <Avatar name={name} src={profile.avatar_url} />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold leading-6">{name}</h3>

          {second ? (
            <div className="mt-1 flex items-start gap-2 text-[15px] leading-6">
              <p className="text-sm ">{second}</p>
            </div>
            
          ) : null}

          {location ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              {location}
            </p>
          ) : null}

          {headline ? (
            <div className="mt-1 flex items-start gap-2 text-[15px] leading-6">
              
              <p className="mt-2 text-sm text-muted-foreground line-clamp-1">{headline}</p>
            </div>
          ) : null}

          

          
        </div>
      </div>
    </article>
  );
}
