// components/dashboard/SuggestionCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";

/* --- utils --------------------------------------------------------------- */
const cn = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

function toInitCaps(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/* --- Avatar -------------------------------------------------------------- */
function Avatar({
  name,
  src,
  size = 56, // match DirectoryProfileCard
}: {
  name: string;
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
          alt={name}
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

/* --- Suggestion Card ----------------------------------------------------- */
export default function SuggestionCard({
  href = "/directory",
  name,
  avatar,
  /** optional rich fields */
  degree,
  branch,
  designation,
  company,
  city,
  country,
  /** legacy meta fallback */
  meta,
  className,
}: {
  href?: string;
  name: string;
  avatar?: string | null;
  degree?: string | null;
  branch?: string | null;
  designation?: string | null;
  company?: string | null;
  city?: string | null;
  country?: string | null;
  meta?: string;
  className?: string;
}) {
  const displayName = toInitCaps(name);

  /* --- Clean Branch (remove "Engineering") --- */
  const cleanBranch = branch ? branch.replace(/engineering/i, "").trim() : "";

  /* --- Headline: "Designation @ Company" --- */
  const headline =
    designation && company ? `${designation} @ ${company}` : designation ?? company ?? "";

  /* --- Location --- */
  const location = city && country ? `${city}, ${country}` : city || country || "";

  const hasRich = Boolean(cleanBranch) || Boolean(headline) || Boolean(location);

  return (
    <Link
      href={href}
      className={cn(
        "group rounded-2xl border bg-card/50 p-4 shadow-sm hover:shadow transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "flex items-start gap-4",
        className
      )}
      aria-label={`View profile of ${displayName}`}
    >
      <Avatar name={displayName} src={avatar ?? undefined} />

      <div className="min-w-0 flex-1">
        {/* Name */}
        <h3 className="text-lg font-semibold leading-6 line-clamp-1">
          {displayName}
        </h3>

        {/* Branch only (no year) */}
        {cleanBranch ? (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
            {cleanBranch}
          </p>
        ) : null}

        {/* Headline */}
        {headline ? (
          <p className="mt-1 text-sm text-muted-foreground font-medium line-clamp-1">
            {headline}
          </p>
        ) : null}

        {/* Location */}
        {location ? (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
            {location}
          </p>
        ) : null}

        {/* Legacy fallback */}
        {!hasRich && meta ? (
          <p className="mt-1 text-wrap text-sm text-muted-foreground line-clamp-1">
            {meta}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
