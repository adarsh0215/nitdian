// app/page.tsx (Homepage)
// Purpose: Compose the homepage from smaller, focused components.
// Note: This file intentionally keeps some sections commented out (for feature toggles).
// Do not change imports unless you know the component is being removed — keeping them
// commented makes it easy to re-enable later.

import Hero from "@/components/home/Hero";
import BrandStrip from "@/components/home/BrandStrip";
import ValueGrid from "@/components/home/ValueGrid";
// import QuickActions from "@/components/home/QuickActions"; // ← keep commented if not used
// import Spotlight from "@/components/home/Spotlight";       // ← remove import while section is commented
import Testimonials from "@/components/home/Testimonials";
import HowItWorks from "@/components/home/HowItWorks";
import JoinCta from "@/components/home/JoinCta";
import SiteFooter from "@/components/home/SiteFooter";
// import Highlight from "@/components/home/Highlight";
import Featured from "@/components/home/Featured";
import { HOMEPAGE_DATA } from "@/components/home/data";
import ImageTicker from "@/components/home/ImageTicker";
import EventSection from "@/components/home/EventSection";
import Image from "next/image"; // add at the top with other imports
import PosterPlain from "@/components/home/PosterPlain";
import EventCard from "@/components/home/EventSection";

export const metadata = {
  title: "Alumni Network — NIT Durgapur",
  description: "Connect, grow, and give back — the alumni advantage.",
};

export default function Page() {
  // Local alias for the home page data object. Keep as-is for clarity when passing props.
  const d = HOMEPAGE_DATA;

  return (
    // Main wrapper: ensures full viewport height and consistent background/foreground tokens.
    <main className="min-h-[100dvh] bg-background text-foreground">
      {/* Announcement (uncomment if you want to show it) */}
      {/* <AnnouncementBar
        text={d.announcement.text}
        ctaLabel={d.announcement.cta.label}
        ctaHref={d.announcement.cta.href}
      /> */}

      {/* Hero */}
      <Hero
        headline={d.hero.headline}
        subtext={d.hero.subtext}
        primary={{ label: d.hero.primary.label, href: d.hero.primary.href }}
        microProof={d.hero.microProof}
      />

      {/* Brand strip: logos / partner strip directly under hero */}
      <BrandStrip caption={d.brands.caption} brands={d.brands.items} />

      {/* Event Section: latest event announcement with details and payment info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EventCard variant="hero" />
        </div>
      </section>

      {/* Why join / Value grid */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ValueGrid
            heading={d.valuesSection.heading}
            subheading={d.valuesSection.subheading}
            items={d.valuesSection.items}
          />
        </div>
      </section>

      {/* Highlight (carousel) — kept commented for now */}
      {/* <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Highlight
            heading={d.highlightData.heading}
            subheading={d.highlightData.subheading ?? ""}  // ← safe fallback
            items={d.highlightData.items}
          />
        </div>
      </section> */}

      {/* Quick actions (uncomment to use) */}
      {/* <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <QuickActions
            heading={d.quickActionsSection.heading}
            subheading={d.quickActionsSection.subheading}
            items={d.quickActionsSection.items}
          />
        </div>
      </section> */}

      {/* Spotlight (commented out for now) */}
      {/* <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Spotlight
            heading={d.spotlightSection.heading}
            subheading={d.spotlightSection.subheading}
            event={d.spotlightSection.event}
          />
        </div>
      </section> */}

      {/* Testimonials */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Testimonials
            heading={d.testimonialsSection.heading}
            subheading={d.testimonialsSection.subheading}
            items={d.testimonialsSection.items}
          />
        </div>
      </section>

      {/* Featured section */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Featured
            heading={d.featuredData.heading}
            subheading={d.featuredData.subheading}
            items={d.featuredData.items}
          />
        </div>
      </section>

      {/* Image ticker for alumni moments — kept inside a centered container for consistent spacing */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Our Alumni Moments
        </h2>
        <ImageTicker />
      </div>

      {/* How it works / Steps */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HowItWorks
            heading={d.howSection.heading}
            subheading={d.howSection.subheading}
            steps={d.howSection.steps}
          />
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <JoinCta
            headline={d.joinSection.headline}
            subheading={d.joinSection.subheading}
            cta={d.joinSection.cta}
          />
        </div>
      </section>

      {/* Footer */}
      <SiteFooter {...d.footer} />
    </main>
  );
}
