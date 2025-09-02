"use client";

import * as React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TestimonialItem } from "./types";

/**
 * Testimonials with:
 * - Section heading + subheading
 * - Mobile: horizontal swipe with scroll-snap
 * - Desktop: tidy grid
 * - Optional avatar
 * - Subtle quote styling
 */
export default function Testimonials({
  heading,
  subheading,
  items,
}: {
  heading: string;
  subheading: string;
  items: TestimonialItem[];
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  function scrollByCard(dir: "prev" | "next") {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const cardWidth = card ? card.clientWidth + 16 /* gap approx */ : 320;
    el.scrollBy({ left: dir === "next" ? cardWidth : -cardWidth, behavior: "smooth" });
  }

  return (
    <div className="space-y-8">
      {/* Section heading */}
      <div className="text-center mx-auto max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{heading}</h2>
        <p className="mt-2 text-muted-foreground">{subheading}</p>
      </div>

      {/* Mobile: horizontal snap scroller */}
      <div className="sm:hidden relative">
        {/* Controls (optional) */}
        <div className="absolute -top-12 right-0 flex gap-2">
          <button
            onClick={() => scrollByCard("prev")}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-muted"
            aria-label="Previous testimonial"
          >
            ←
          </button>
          <button
            onClick={() => scrollByCard("next")}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-muted"
            aria-label="Next testimonial"
          >
            →
          </button>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar"
          role="list"
          aria-label="Testimonials"
        >
          {items.map((t, i) => (
            <Card
              key={i}
              data-card
              role="listitem"
              className="min-w-[85%] snap-center rounded-2xl border bg-card/80 backdrop-blur-sm"
            >
              <CardHeader className="space-y-3">
                <blockquote className="text-base leading-relaxed">
                  <span aria-hidden className="mr-1 text-2xl align-top">“</span>
                  {t.quote}
                  <span aria-hidden className="ml-1 text-2xl align-bottom">”</span>
                </blockquote>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  {t.avatar ? <AvatarImage src={t.avatar} alt={t.author} /> : null}
                  <AvatarFallback>{initials(t.author)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{t.author}</div>
                  {t.role ? <div className="text-xs text-muted-foreground">{t.role}</div> : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {items.map((t, i) => (
          <Card key={i} className="rounded-2xl border bg-card/80 backdrop-blur-sm h-full">
            <CardHeader className="space-y-3">
              <blockquote className="text-base leading-relaxed">
                <span aria-hidden className="mr-1 text-2xl align-top">“</span>
                {t.quote}
                <span aria-hidden className="ml-1 text-2xl align-bottom">”</span>
              </blockquote>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                {t.avatar ? <AvatarImage src={t.avatar} alt={t.author} /> : null}
                <AvatarFallback>{initials(t.author)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{t.author}</div>
                {t.role ? <div className="text-xs text-muted-foreground">{t.role}</div> : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** Turns "Ritwik ’16" -> "R’"; "Shruti ’12" -> "S’" */
function initials(name: string) {
  const first = (name || "").trim().charAt(0).toUpperCase();
  return first || "A";
}
