"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  UserRound,
  BriefcaseBusiness,
  GraduationCap,
  UsersRound,
  Handshake,
  type LucideIcon,
} from "lucide-react";

/* ---------- icon map (client side) ---------- */
const ICONS = {
  user: UserRound,
  briefcase: BriefcaseBusiness,
  graduation: GraduationCap,
  users: UsersRound,
  handshake: Handshake,
} satisfies Record<string, LucideIcon>;
type IconKey = keyof typeof ICONS;

/* ---------- Types (no React components in data) ---------- */
export type HighlightItem = {
  quote: string;
  author: string;
  role?: string;
  /** pass a string like "briefcase" | "graduation" | "users" | "handshake" | "user" */
  icon?: IconKey;
};

export type HighlightProps = {
  heading: string;
  subheading: string;
  items: HighlightItem[];
};

/* ================ Component ================ */
export default function Highlight({ heading, subheading, items }: HighlightProps) {
  if (!items?.length) return null;

  return (
    <section className="space-y-8">
      {/* Heading */}
      <div className="text-center mx-auto max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{heading}</h2>
        <p className="mt-2 text-muted-foreground">{subheading}</p>
      </div>

      {/* Carousel */}
      <div className="relative -mx-4 px-4">
        <Carousel opts={{ loop: true, align: "start", containScroll: "trimSnaps" }}>
          <CarouselContent className="-ml-4 no-scrollbar">
            {items.map((it, i) => (
              <CarouselItem
                key={`${it.author}-${i}`}
                className="
                  pl-4
                  basis-[calc(100%_-_3.25rem)]   /* mobile: 1 card + peek */
                  sm:basis-1/2                    /* 2-up */
                  md:basis-1/3                    /* 3-up */
                  lg:basis-1/4                    /* 4-up */
                "
              >
                <HighlightCard item={it} />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="hidden sm:flex left-2" />
          <CarouselNext className="hidden sm:flex right-2" />
        </Carousel>

        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}

/* ================= Single Card ================= */
function HighlightCard({ item }: { item: HighlightItem }) {
  const Icon = ICONS[item.icon ?? "user"];

  return (
    <article
      className="
        h-full rounded-2xl border border-border bg-card shadow-sm
        transition-all duration-300 hover:shadow-md
        p-5 flex flex-col
      "
      aria-label={`Testimonial by ${item.author}`}
    >
      {/* Quote */}
      <blockquote
        className="
          text-base sm:text-[17px] leading-relaxed
          sm:text-balance break-words hyphens-auto
          min-h-[8.25rem]
        "
      >
        <span aria-hidden className="mr-1 text-2xl align-top select-none text-primary">“</span>
        <span>{item.quote}</span>
        <span aria-hidden className="ml-1 text-2xl align-bottom select-none text-primary">”</span>
      </blockquote>

      {/* Divider */}
      <div className="mt-6 mb-4 h-px w-full bg-border/70" />

      {/* Footer with ICON (no avatar) */}
      <div className="mt-auto flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted ring-2 ring-background flex items-center justify-center">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
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
