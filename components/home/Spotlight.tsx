"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin } from "lucide-react";

export type Cta = { label: string; href: string };
export type SpotlightEvent = {
  title: string;
  blurb: string;
  date: string;
  location: string;
  image?: string | null;
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
      {/* Section heading */}
      <div className="text-center mx-auto max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{heading}</h2>
        <p className="mt-2 text-muted-foreground">{subheading}</p>
      </div>

      {/* Event card */}
      <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image side */}
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

          {/* Content side */}
          <CardContent className="flex flex-col justify-between p-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
                {event.title}
              </h3>
              <p className="mt-2 text-muted-foreground">{event.blurb}</p>

              {/* Meta chips */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 ring-1 ring-border">
                  <CalendarDays className="h-4 w-4" />
                  <span>{event.date}</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 ring-1 ring-border">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </span>
              </div>
            </div>

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
