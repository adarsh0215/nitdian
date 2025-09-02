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
  const [expanded, setExpanded] = React.useState(false);
  const [collapsedMax, setCollapsedMax] = React.useState(0);   // 4 lines
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
      const max = Math.round(lh * 4 + 2); // 4 lines
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
          lg:[grid-template-columns:280px_1fr]
        "
      >
        {/* Left: avatar + identity (centered on md+) */}
        <div className="flex gap-4 md:flex-col md:items-center md:text-center">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 bg-card ring-4 ring-background shadow-sm">
            {item.avatar ? <AvatarImage src={item.avatar} alt={item.author} /> : null}
            <AvatarFallback className="text-lg font-semibold">
              {initials(item.author)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-1">
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

        {/* Right: message (smooth expand/collapse) */}
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
              className="text-balance text-base sm:text-lg leading-relaxed"
            >
              <span aria-hidden className="mr-1 text-2xl align-top select-none text-primary">“</span>
              {item.quote}
              <span aria-hidden className="ml-1 text-2xl align-bottom select-none text-primary">”</span>
            </div>

            {!expanded && canExpand && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-card" />
            )}
          </div>

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
    </section>
  );
}


/* ---------------- Small cards ---------------- */
function Small({ item }: { item: TestimonialItem }) {
  const [expanded, setExpanded] = React.useState(false);
  const [collapsedMax, setCollapsedMax] = React.useState(0);   // 4 lines
  const [contentHeight, setContentHeight] = React.useState(0);
  const [canExpand, setCanExpand] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const compute = () => {
      const lh = parseFloat(getComputedStyle(el).lineHeight || "20");
      const max = Math.round(lh * 4 + 2); // 4 lines
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
        p-4 sm:p-5 w-full h-full
        transition-all duration-300 hover:shadow-md hover:-translate-y-0.5
        flex flex-col
      "
    >
      {/* Quote */}
      <div className="relative min-w-0">
        <div
          ref={contentRef}
          style={{
            maxHeight: expanded ? contentHeight : collapsedMax,
            transition: "max-height 300ms ease",
            overflow: "hidden",
            willChange: "max-height",
          }}
          className="text-sm sm:text-base leading-relaxed break-words"
        >
          <span aria-hidden className="mr-1 text-xl align-top select-none text-primary">“</span>
          {item.quote}
          <span aria-hidden className="ml-1 text-xl align-bottom select-none text-primary">”</span>
        </div>

        {!expanded && canExpand && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-card" />
        )}
      </div>

      {/* Toggle */}
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

      {/* Footer pinned to bottom */}
      <div className="mt-auto pt-4 border-t border-border/70">
        <div className="flex items-center gap-3 min-w-0">
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
