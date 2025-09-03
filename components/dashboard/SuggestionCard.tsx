// components/dashboard/SuggestionCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";

const cn = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

function Avatar({
  name,
  src,
  size = 40, // keeps it compact for suggestions; visually consistent with directory style
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

export default function SuggestionCard({
  href = "/directory",
  name,
  avatar,
  meta,
  className,
}: {
  href?: string;
  name: string;
  avatar?: string | null;
  meta?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-2xl border bg-card/50 p-3 shadow-sm transition hover:shadow-md hover:bg-card",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "flex items-start gap-3",
        className
      )}
    >
      <Avatar name={name} src={avatar ?? undefined} />

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium leading-6 tracking-[-0.01em] truncate">
          {name}
        </div>

        {meta ? (
          <p className="mt-0.5 text-xs text-muted-foreground leading-5 line-clamp-1">
            {meta}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
