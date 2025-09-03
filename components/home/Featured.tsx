// components/home/Featured.tsx
"use client";

import * as React from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FeaturedItem } from "./types";

export type FeaturedProps = {
  heading: string;
  subheading: string;
  items: FeaturedItem[];
};

export default function Featured({ heading, subheading, items }: FeaturedProps) {
  // ✅ Hooks must be at the top-level, before any early return
  const [api, setApi] = React.useState<CarouselApi | null>(null);

  if (!items?.length) return null;

  return (
    <section className="space-y-8">
      {/* Heading */}
      <div className="text-center mx-auto max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{heading}</h2>
        <p className="mt-2 text-muted-foreground">{subheading}</p>
      </div>

      {/* Carousel (manual arrows) */}
      <div className="relative -mx-4 px-4">
        <Carousel
          opts={{ loop: true, align: "start", containScroll: "trimSnaps" }}
          setApi={setApi}
        >
          <CarouselContent className="-ml-4">
            {items.map((it, i) => (
              <CarouselItem
                key={`${it.author}-${i}`}
                className="
                  pl-4
                  basis-[calc(100%_-_3.25rem)]  /* mobile: 1 card + peek */
                  sm:basis-1/2                   /* 2-up */
                  md:basis-1/3                   /* 3-up */
                  lg:basis-1/4                   /* 4-up */
                "
              >
                <FeaturedCard item={it} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Controls BELOW */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => api?.scrollPrev()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card shadow text-foreground/80 hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => api?.scrollNext()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card shadow text-foreground/80 hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Card with expand/collapse ---------- */
function FeaturedCard({ item }: { item: FeaturedItem }) {
  const [expanded, setExpanded] = React.useState(false);
  const [collapsedMax, setCollapsedMax] = React.useState(0); // px for 4 lines
  const [contentHeight, setContentHeight] = React.useState(0);
  const [canExpand, setCanExpand] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Measure heights (quote change + resize)
  React.useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const compute = () => {
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize || "16");
      const lhRaw = cs.lineHeight;
      const lh = lhRaw === "normal" || !lhRaw ? 1.5 * fs : parseFloat(lhRaw);
      const max = Math.round(lh * 4 + 2); // 4 lines + fuzz
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
        h-full rounded-2xl border border-border bg-card shadow-sm
        transition-all duration-300 hover:shadow-md
        p-5 flex flex-col
      "
    >
      {/* Quote with smooth expand/collapse */}
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
          <span aria-hidden className="mr-1 text-2xl align-top select-none text-primary">“</span>
          {item.quote}
          <span aria-hidden className="ml-1 text-2xl align-bottom select-none text-primary">”</span>
        </div>
      </div>

      {/* Toggle aligned right */}
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

      {/* Footer BAR (with integrated separator) */}
      <div className="mt-auto pt-4 border-t border-border/70 flex items-center gap-3">
        <Avatar className="h-10 w-10 bg-muted ring-2 ring-background">
          {item.avatar ? <AvatarImage src={item.avatar} alt={item.author} /> : null}
          <AvatarFallback className="text-xs font-medium">
            {initials(item.author)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-[15px] sm:text-base font-semibold leading-tight truncate">
            {item.author}
          </div>
          {item.role ? (
            <div className="text-sm text-muted-foreground leading-tight truncate">
              {item.role}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/* ---------- Helpers ---------- */
function initials(name: string) {
  const n = (name || "").trim();
  if (!n) return "A";
  const [a, b] = n.split(/\s+/);
  return ((a?.[0] || "") + (b?.[0] || "")).toUpperCase();
}
