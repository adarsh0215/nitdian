// components/home/Testimonials.tsx
"use client";

import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

/* ---------- Types ---------- */
export type TestimonialItem = {
  quote: string;
  author: string;
  role?: string;
  avatar?: string | null;
};

export default function Testimonials({
  heading,
  subheading,
  items,
  count = 3, // show up to 3 stacked cards
}: {
  heading: string;
  subheading?: string;
  items: TestimonialItem[];
  count?: number;
}) {
  if (!items?.length) return null;
  const featured = items.slice(0, Math.max(1, Math.min(count, 3)));

  return (
    <section className="space-y-8">
      {/* Section header */}
      <div className="text-center mx-auto max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{heading}</h2>
        {subheading ? <p className="mt-2 text-muted-foreground">{subheading}</p> : null}
      </div>

      {/* Three stacked featured cards */}
      <div className="space-y-6">
        {featured.map((item, i) => (
          <FeaturedCard key={`${item.author}-${i}`} item={item} />
        ))}
      </div>
    </section>
  );
}

/* ---------- Featured full-width card ---------- */
function FeaturedCard({ item }: { item: TestimonialItem }) {
  const [expanded, setExpanded] = React.useState(false);
  const [collapsedMax, setCollapsedMax] = React.useState(0);   // px for 4 lines
  const [contentHeight, setContentHeight] = React.useState(0);
  const [canExpand, setCanExpand] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const compute = () => {
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize || "16");
      const lhRaw = cs.lineHeight;
      const lh = lhRaw === "normal" || !lhRaw ? 1.5 * fs : parseFloat(lhRaw);
      const max = Math.round(lh * 5 + 2); // 4 lines (tiny buffer)
      setCollapsedMax(max);
      setContentHeight(el.scrollHeight);
      setCanExpand(el.scrollHeight > max + 1);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [item.quote]);

  return (
    <section className="rounded-3xl border border-border bg-muted p-4 sm:p-6 md:p-8">
      <div
        className="
          grid gap-5 md:gap-8 items-start
          md:[grid-template-columns:minmax(220px,_280px)_1fr]
          lg:[grid-template-columns:300px_1fr]
        "
      >
        {/* Left rail: avatar + identity (centered on md+) */}
        <div className="flex gap-4 md:flex-col md:items-center md:text-center">
          <Avatar className="h-20 w-20 sm:h-48 sm:w-48 bg-card ring-4 ring-background shadow-sm">
            {item.avatar ? <AvatarImage src={item.avatar} alt={item.author} /> : null}
            <AvatarFallback className="text-lg font-semibold">
              {initials(item.author)}
            </AvatarFallback>
          </Avatar>

          <div className="whitespace-pre-line min-w-0 space-y-1">
            <div className="text-lg font-semibold leading-tight text-balance">
              {item.author}
            </div>
            {item.role ? (
              <div className="text-sm text-muted-foreground leading-tight">
                {item.role}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: message (smooth expand/collapse + FADE when collapsed) */}
        <blockquote className="rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-6 md:p-7 min-w-0 transition-shadow duration-300 hover:shadow-md">
          <div className="relative">
            <div
              ref={contentRef}
              style={{
                maxHeight: expanded ? contentHeight : collapsedMax,
                transition: "max-height 300ms ease",
                overflow: "hidden",
                willChange: "max-height",
              }}
              className="whitespace-pre-line text-base sm:text-lg leading-relaxed"
            >
              <span aria-hidden className="mr-1 text-2xl align-top select-none text-primary ">“</span>
              {item.quote}
              
              <span aria-hidden className="ml-1 text-2xl align-bottom select-none text-primary">”</span>
            </div>

            {/* Fade overlay only when collapsed */}
            {!expanded && canExpand && (
              <div
                className="
                  pointer-events-none absolute inset-x-0 bottom-0 h-10
                  bg-gradient-to-b from-transparent to-card
                "
                aria-hidden
              />
            )}
          </div>

          {/* Toggle aligned right */}
          {canExpand && (
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              aria-expanded={expanded}
              className="mt-3 ml-auto block text-sm font-medium underline underline-offset-4"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          )}
        </blockquote>
      </div>
    </section>
  );
}


/* ---------- Helpers ---------- */
function initials(name: string) {
  const n = (name || "").trim();
  if (!n) return "A";
  const [a, b] = n.split(/\s+/);
  return ((a?.[0] || "") + (b?.[0] || "")).toUpperCase();
}
