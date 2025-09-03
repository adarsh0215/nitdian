"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Brand } from "./types";

function looksLikeImagePath(s?: string) {
  if (!s) return false;
  return s.startsWith("/") || s.startsWith("http://") || s.startsWith("https://");
}

type Props = {
  caption: string;
  brands: Brand[];
  /** Seconds for one full loop (lower = faster). Default 30s */
  speedSecs?: number;
  /** Horizontal gap between items in rem (visual). Default 3rem (gap-12) */
  gapClassName?: string;
};

// Helper type to allow CSS custom properties without `any`
type TrackStyle = React.CSSProperties & { ["--dur"]?: string };

export default function BrandStrip({
  caption,
  brands,
  speedSecs = 30,
  gapClassName = "gap-12",
}: Props) {
  // Duplicate the array once to create a seamless loop
  const loop = React.useMemo(() => [...brands, ...brands], [brands]);

  // Typed CSS var for animation duration
  const trackStyle = React.useMemo<TrackStyle>(
    () => ({ ["--dur"]: `${speedSecs}s` }),
    [speedSecs]
  );

  return (
    <section className="border-y border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-3xl font-medium text-center mb-8">{caption}</p>

        {/* Ticker rail */}
        <div className="relative group">
          {/* gradient fades (edges) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent"
          />

          {/* Outer overflow container */}
          <div className="overflow-hidden">
            {/* Track: duplicate content once; translateX -50% over N seconds */}
            <ul
              role="list"
              className={[
                "flex w-max items-center",
                gapClassName,
                // keyframes name + CSS var for dynamic duration
                "animate-[scroll-x_var(--dur)_linear_infinite]",
                // pause on hover
                "group-hover:[animation-play-state:paused]",
                // users who prefer reduced motion get manual scroll instead
                "motion-reduce:animate-none motion-reduce:overflow-x-auto motion-reduce:no-scrollbar",
              ].join(" ")}
              style={trackStyle}
            >
              {loop.map((b, i) => {
                const src = b.logoUrl ?? (looksLikeImagePath(b.name) ? b.name : undefined);

                const Wrap = ({ children }: { children: React.ReactNode }) =>
                  b.href ? (
                    <Link href={b.href} aria-label={b.name} className="transition">
                      {children}
                    </Link>
                  ) : (
                    <div className="transition">{children}</div>
                  );

                return (
                  <li role="listitem" key={`${b.name}-${i}`} className="shrink-0">
                    {src ? (
                      <Wrap>
                        <div className="relative h-10 sm:h-12 md:h-14 w-[110px] sm:w-[130px] md:w-[140px]">
                          <Image
                            src={src}
                            alt={b.name}
                            fill
                            sizes="140px"
                            className="object-contain"
                            priority={false}
                          />
                        </div>
                      </Wrap>
                    ) : (
                      <span className="whitespace-nowrap text-sm sm:text-base font-medium">
                        {b.logoText ?? b.name}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Keyframes (component-scoped) */}
      <style jsx global>{`
        @keyframes scroll-x {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
