// components/home/EventSection.tsx
// Center-aligned Event card for dashboard/home — visually consistent with ProfileCard.
// Defaults: ctaLabel = "Watch live", ctaHref = "/live"

import Link from "next/link";
import { Button } from "@/components/ui/button";

type EventDate = {
  date: string;
  times: string;
};

export default function EventSection({
  title,
  subtitle,
  dates = [],
  ctaLabel = "Watch live",
  ctaHref = "/live",
}: {
  title: string;
  subtitle?: string;
  dates?: EventDate[];
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <section aria-labelledby="event-heading" className="py-0 sm:py-0 h-full">
      <div className="h-full">
        <article
          className="relative h-full overflow-hidden rounded-2xl border bg-card p-6 sm:p-8 shadow-sm text-center"
          role="region"
          aria-label={title}
        >
          {/* Decorative top accent bar instead of left for centered style */}
          <div
            className="absolute top-0 left-0 w-full h-1 bg-primary/80 rounded-t-2xl"
            aria-hidden
          />

          <div className="relative z-10 h-full flex flex-col items-center">
            {/* Title & subtitle */}
            <header className="mb-6">
              <h3 id="event-heading" className="text-2xl font-bold">
                {title}
              </h3>
              {subtitle ? (
                <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
              <p className="mt-2 text-base sm:text-lg font-semibold text-primary">
                Youth Power & Indian Knowledge Tradition
              </p>
            </header>

            {/* Dates grid */}
            <div className="mb-8 w-full space-y-3">
              {dates.map((d, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-background/50 px-6 py-4"
                >
                  <div className="rounded-md border bg-muted px-3 py-1 text-lg font-medium text-muted-foreground">
                    {d.date}
                  </div>
                  <div className="mt-1 text-xl font-bold whitespace-pre-line">
                    {d.times}
                  </div>
                </div>
              ))}

              {dates.length === 0 ? (
                <div className="rounded-lg border bg-background/50 px-4 py-6 text-sm text-muted-foreground">
                  No schedule available
                </div>
              ) : null}
            </div>

            {/* Description */}
            <p className="mb-6 text-sm text-muted-foreground">
              Click the button below to watch the live stream.
            </p>

            {/* CTA */}
            {/* CTA */}
            <div className="mt-auto">
              <Button asChild size="lg">
                {ctaHref === "/login" ? (
                  // Login: same-page navigation
                  <Link href={ctaHref} aria-label={ctaLabel}>
                    {ctaLabel}
                  </Link>
                ) : (
                  // Live or external: open in new tab
                  <Link
                    href={ctaHref}
                    aria-label={ctaLabel}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ctaLabel}
                  </Link>
                )}
              </Button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
