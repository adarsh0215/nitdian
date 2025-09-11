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
import Link from "next/link"

export type FeaturedItem = {
  quote: string;
  author: string;
  role?: string;
  year?: number | string;   // ⬅️ NEW
  avatar?: string | null;
};

export default function Featured({
  heading,
  subheading,
  items,
}: {
  heading: string;
  subheading: string;
  items: FeaturedItem[];
}) {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  if (!items?.length) return null;

  return (
    <section className="space-y-8">
      <div className="text-center mx-auto max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{heading}</h2>
        <p className="mt-2 text-muted-foreground">{subheading}</p>
        <Link href="/memoirs" className="mt-4 text-sm">Explore all Memoirs</Link>
      </div>

      <div className="relative -mx-4 px-4">
        <Carousel opts={{ loop: true, align: "start", containScroll: "trimSnaps" }} setApi={setApi}>
          <CarouselContent className="-ml-4">
            {items.map((it, i) => (
              <CarouselItem
                key={`${it.author}-${i}`}
                className="pl-4 basis-[calc(100%_-_3.25rem)] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <FeaturedCard item={it} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

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

function FeaturedCard({ item }: { item: FeaturedItem }) {
  const [expanded, setExpanded] = React.useState(false);
  const [collapsedMax, setCollapsedMax] = React.useState(0);
  const [contentHeight, setContentHeight] = React.useState(0);
  const [canExpand, setCanExpand] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const compute = () => {
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize || "16");
      const lh = cs.lineHeight === "normal" || !cs.lineHeight ? 1.5 * fs : parseFloat(cs.lineHeight);
      const max = Math.round(lh * 5 + 2); // ~5 lines
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
    <article className="h-full rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md p-5 flex flex-col">
      {/* Quote with smooth expand/collapse + FADE when collapsed */}
      <div className="relative min-w-0">
        <div
          ref={contentRef}
          style={{
            maxHeight: expanded ? contentHeight : collapsedMax,
            transition: "max-height 300ms ease",
            overflow: "hidden",
            willChange: "max-height",
          }}
          className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-line"
        >
          <span aria-hidden className="mr-1 text-xl inline-block select-none text-primary">“</span>
          {item.quote}
          <span aria-hidden className="ml-1 text-xl inline-block select-none text-primary">”</span>
        </div>

        {/* ⬇️ Fade overlay only when collapsed */}
        {!expanded && canExpand && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-card"
          />
        )}
      </div>

      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          className="mt-3 ml-auto text-xs sm:text-sm font-medium underline underline-offset-4"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}

      <div className="mt-auto pt-4 border-t border-border/70 flex items-center gap-3">
        <Avatar className="h-10 w-10 bg-muted ring-2 ring-background">
          {item.avatar ? <AvatarImage src={item.avatar} alt={item.author} /> : null}
          <AvatarFallback className="text-xs font-medium">{initials(item.author)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-[15px] sm:text-base font-semibold leading-tight truncate">{item.author}</div>
          {item.role && <div className="text-sm text-muted-foreground leading-tight truncate">{item.role}</div>}
          {item.year && <div className="text-sm text-muted-foreground/90 leading-tight truncate">{item.year}</div>}
        </div>
      </div>
    </article>
  );
}


function initials(name: string) {
  const n = (name || "").trim();
  if (!n) return "A";
  const [a, b] = n.split(/\s+/);
  return ((a?.[0] || "") + (b?.[0] || "")).toUpperCase();
}
