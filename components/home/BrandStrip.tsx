"use client";

import Image from "next/image";
import Link from "next/link";
import type { Brand } from "./types";

function looksLikeImagePath(s?: string) {
  if (!s) return false;
  return s.startsWith("/") || s.startsWith("http://") || s.startsWith("https://");
}

export default function BrandStrip({
  caption,
  brands,
}: {
  caption: string;
  brands: Brand[];
}) {
  return (
    <section className="border-y border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-sm text-muted-foreground mb-4">{caption}</p>

        <div className="flex items-center gap-8 sm:gap-12 overflow-x-auto no-scrollbar py-1">
          {brands.map((b) => {
            const src = b.logoUrl ?? (looksLikeImagePath(b.name) ? b.name : undefined);

            const Wrap = (props: React.PropsWithChildren) =>
              b.href ? (
                <Link href={b.href} aria-label={b.name} className="transition">
                  {props.children}
                </Link>
              ) : (
                <div className="transition">{props.children}</div>
              );

            return src ? (
              <Wrap key={b.name}>
                {/* Bigger logo box; no grayscale/opacity filters */}
                <div className="relative h-10 sm:h-12 md:h-14 w-[100px] sm:w-[100px] md:w-[100px]">
                  <Image
                    src={src}
                    alt={b.name}
                    fill
                    sizes="200px"
                    className="object-contain  /* optional: dark:invert-0 */"
                    priority={false}
                  />
                </div>
              </Wrap>
            ) : (
              <span
                key={b.name}
                className="whitespace-nowrap text-sm sm:text-base font-medium"
              >
                {b.logoText ?? b.name}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
