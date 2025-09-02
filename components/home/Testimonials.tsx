"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { TestimonialItem } from "./types";

export default function Testimonials({
  heading,
  subheading,
  items,
}: {
  heading: string;
  subheading: string;
  items: TestimonialItem[];
}) {
  if (!items?.length) return null;
  const [featured, ...rest] = items;

  return (
    <section className="space-y-10">
      {/* Section header */}
      <div className="text-center mx-auto max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{heading}</h2>
        <p className="mt-2 text-muted-foreground">{subheading}</p>
      </div>

      {/* Featured */}
      <Featured item={featured} />

      {/* Small cards */}
      {/* Mobile: horizontal swipe */}
      <div className="sm:hidden -mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-4">
          {rest.map((t, i) => (
            <Small key={i} item={t} />
          ))}
        </div>
      </div>

      {/* Desktop: tidy grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
        {rest.map((t, i) => (
          <Small key={i} item={t} />
        ))}
      </div>
    </section>
  );
}

/* ---------------- Featured (expand/collapse) ---------------- */
function Featured({ item }: { item: TestimonialItem }) {
  // Local expand/collapse (no navigation)
  const [expanded, setExpanded] = React.useState(false);
  const [collapsedMax, setCollapsedMax] = React.useState(0);   // ~3 lines height
  const [contentHeight, setContentHeight] = React.useState(0); // full content height
  const [canExpand, setCanExpand] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Measure on mount, quote change, and resize
  React.useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const compute = () => {
      const cs = getComputedStyle(el);
      const lhRaw = cs.lineHeight;
      const fs = parseFloat(cs.fontSize || "16");
      const lh =
        lhRaw === "normal" || !lhRaw ? 1.5 * fs : parseFloat(lhRaw); // sensible fallback
      const max = Math.round(lh * 4 + 2); // ≈ 3 lines
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
    <div className="rounded-3xl border border-border bg-muted p-5 sm:p-7 md:p-9">
      {/* Mobile: stack; md+: two columns */}
      <div
        className="
          grid items-start gap-6 md:gap-8
          md:[grid-template-columns:minmax(220px,_280px)_1fr]
          lg:[grid-template-columns:300px_1fr]
        "
      >
        {/* Left rail: avatar + identity (unchanged) */}
        <div className="flex items-center gap-4 md:flex-col md:items-center md:text-center">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-background bg-card shadow-sm">
            {item.avatar ? <AvatarImage src={item.avatar} alt={item.author} /> : null}
            <AvatarFallback className="text-lg font-semibold">
              {initials(item.author)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-1">
            <div className="text-base sm:text-lg font-medium leading-tight truncate">
              {item.author}
            </div>
            {item.role ? (
              <div className="text-sm text-muted-foreground leading-tight">
                {item.role}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: message card with animated height + fade */}
        <blockquote
          className="
            rounded-2xl border border-border bg-card shadow-sm
            p-4 sm:p-6 md:p-7 min-w-0
            transition-shadow duration-300 hover:shadow-md
          "
        >
          <div className="relative">
            <div
              ref={contentRef}
              style={{
                maxHeight: expanded ? contentHeight : collapsedMax,
                transition: "max-height 300ms ease",
                overflow: "hidden",
              }}
              className="text-balance text-base sm:text-lg leading-relaxed"
            >
              <span aria-hidden className="mr-1 text-2xl align-top select-none text-primary">“</span>
              {item.quote}
              <span aria-hidden className="ml-1 text-2xl align-bottom select-none text-primary">”</span>
            </div>

            {/* Soft bottom fade when collapsed */}
            {!expanded && canExpand && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-card" />
            )}
          </div>

          {/* Toggle — right aligned */}
          {canExpand && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mt-3 ml-auto block text-sm font-medium underline underline-offset-4"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          )}
        </blockquote>
      </div>
    </div>
  );
}


/* ---------------- Small cards ---------------- */
function Small({ item }: { item: TestimonialItem }) {
  const [expanded, setExpanded] = React.useState(false);
  const [collapsedMax, setCollapsedMax] = React.useState(0);   // px for 4 lines
  const [contentHeight, setContentHeight] = React.useState(0); // px full height
  const [canExpand, setCanExpand] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Measure heights (on mount, quote change, and resize)
  React.useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const compute = () => {
      const lh = parseFloat(getComputedStyle(el).lineHeight || "20");
      const max = Math.round(lh * 4 + 2); // 4 lines (with tiny buffer)
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
    <article
      className="
        rounded-2xl border border-border bg-card
        p-4 sm:p-5 min-w-[250px] h-full
        transition-all duration-300 hover:shadow-md hover:-translate-y-0.5
        flex flex-col
      "
    >
      {/* Quote (animated height) */}
      <div className="relative">
        <div
          ref={contentRef}
          style={{
            maxHeight: expanded ? contentHeight : collapsedMax,
            transition: "max-height 300ms ease",
            overflow: "hidden",
          }}
          className="text-sm sm:text-base leading-relaxed"
        >
          {item.quote}
        </div>

        {/* Soft fade when collapsed */}
        {!expanded && canExpand && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-card" />
        )}
      </div>

      {/* Toggle — right aligned */}
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-3 ml-auto text-xs sm:text-sm font-medium underline underline-offset-4"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}

      {/* Footer — always at bottom */}
      <div className="mt-auto pt-4 border-t border-border/70">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 bg-muted ring-2 ring-background">
            {item.avatar ? <AvatarImage src={item.avatar} alt={item.author} /> : null}
            <AvatarFallback className="text-[10px] sm:text-xs font-medium">
              {initials(item.author)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="text-sm sm:text-base font-medium leading-tight truncate">
              {item.author}
            </div>
            {item.role ? (
              <div className="text-xs sm:text-sm text-muted-foreground leading-tight truncate">
                {item.role}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}



/* Helpers */
function initials(name: string) {
  const first = (name || "").trim().charAt(0).toUpperCase();
  return first || "A";
}
