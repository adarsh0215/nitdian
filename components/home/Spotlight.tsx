// components/home/Spotlight.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin } from "lucide-react";

export type Cta = { label: string; href: string };
export type SpotlightEvent = {
  title: string;
  blurb: string;      // this is the message/description shown BELOW the top bar
  date: string;
  location: string;
  image?: string | null; // large image used on the left
  cta: Cta;
};

export default function Spotlight({
  heading,
  subheading,
  event,
}: {
  heading: string;
  subheading: string;
  event: SpotlightEvent;
}) {
  return (
    <div className="space-y-8">
      {/* section heading */}
      <div className="text-center mx-auto max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{heading}</h2>
        <p className="mt-2 text-muted-foreground">{subheading}</p>
      </div>

      {/* event card */}
      <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* image side */}
          {event.image ? (
            <div className="relative h-56 md:h-full">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover object-center"
                priority
              />
            </div>
          ) : (
            <div className="bg-muted flex items-center justify-center h-56 md:h-full">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}

          {/* content side */}
          <CardContent className="flex flex-col p-6">
            {/* TOP BAR: icon + title + subtitle */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-muted ring-2 ring-background flex items-center justify-center">
                {/* use an icon instead of an avatar */}
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold leading-tight truncate">
                  {event.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-tight truncate">
                  {/* subtitle can be location + date (adjust to taste) */}
                  {event.location} • {event.date}
                </p>
              </div>
            </div>

            {/* divider */}
            <div className="mt-4 mb-3 h-px w-full bg-border/70" />

            {/* MESSAGE/DESCRIPTION BELOW (with subtle quote styling) */}
            <blockquote className="text-base sm:text-[17px] leading-relaxed sm:text-balance">
              <span
                aria-hidden
                className="mr-1 text-2xl align-top select-none text-primary"
              >
                “
              </span>
              {event.blurb}
              <span
                aria-hidden
                className="ml-1 text-2xl align-bottom select-none text-primary"
              >
                ”
              </span>
            </blockquote>

            {/* CTA pinned to bottom by spacer */}
            <div className="mt-6">
              <Button asChild size="lg">
                <Link href={event.cta.href}>{event.cta.label}</Link>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
