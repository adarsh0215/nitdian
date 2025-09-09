"use client";

import * as React from "react";
import Image from "next/image";

import type { DirectoryItem } from "./DirectoryClient";

// -------------------------
// Utility: cn
// -------------------------
// Concatenates conditional class names into a single string.
// Filters out falsey values (false, null, undefined).
const cn = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

// -------------------------
// Avatar Component
// -------------------------
// - Renders profile avatar if available
// - Otherwise shows fallback initial in a gradient circle
// - Accepts custom size (default 56px)
// -------------------------
function Avatar({
  name,
  src,
  size = 56,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
}) {
  const initial = (name?.trim()?.[0] || "A").toUpperCase(); // fallback initial
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

function toInitCaps(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}


// -------------------------
// DirectoryProfileCard
// -------------------------
// Displays a single alumni profile card.
// Layout can be "grid" (default) or "list":
// - Shows avatar, name, degree/branch/year, location, and headline (designation@company)
// -------------------------
export default function DirectoryProfileCard({
  profile,
  layout,
}: {
  profile: DirectoryItem;
  layout: "grid" | "list";
}) {
  const name = profile.full_name ?? "Alumni";

  // Headline: "Designation @ Company" if both exist
  const headline =
    profile.designation && profile.company
      ? `${profile.designation} @ ${profile.company}`
      : profile.designation ?? profile.company ?? "";

  // Secondary line: degree • branch • year (cleaned of leading bullet)
  const second = [
    profile.degree && `• ${profile.degree}`,
    profile.branch && `• ${profile.branch}`,
    profile.graduation_year && `• ${profile.graduation_year}`,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/^•\s/, "");

  // Location: city + country if both exist, else whichever is available
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
          {/* Name */}
          <h3 className="text-lg font-semibold leading-6 normal-case">{toInitCaps(name)}</h3>

          {/* Branch / Degree / Graduation Year block */}
          {second ? (
            <div className=" flex flex-col items-start text-[#818589] text-[15px] leading-6">
              <div>
                <p className="text-sm font-bold">{profile.branch}</p>
              </div>
              <div className="flex gap-4">
                <p className="text-sm font-bold">{profile.graduation_year}</p>
                <p className="text-sm font-bold">{profile.degree}</p>
              </div>
            </div>
          ) : null}

          {/* Location */}
          {location ? (
            <p className="mt-6 flex items-center gap-2 font-bold text-sm text-[#818589]">
              {location}
            </p>
          ) : null}

          {/* Headline (designation @ company) */}
          {profile.designation || profile.company ? (
            <div className=" flex flex-col   text-[15px] leading-6">
              {profile.designation ? (
                <p className="text-sm text-[#608286] font-bold">
                  {profile.designation}  {profile.company ? `@ ${profile.company}`: ""}
                </p>
              ) : null}
              {profile.company ? (
                <p className="text-sm text-[#608286] font-bold">
                  
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
