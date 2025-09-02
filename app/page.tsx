import Link from "next/link";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Hero from "@/components/home/Hero";
import BrandStrip from "@/components/home/BrandStrip";
import ValueGrid from "@/components/home/ValueGrid";
import QuickActions from "@/components/home/QuickActions";
import Spotlight from "@/components/home/Spotlight";
import Testimonials from "@/components/home/Testimonials";
import HowItWorks from "@/components/home/HowItWorks";
import JoinCta from "@/components/home/JoinCta";
import SiteFooter from "@/components/home/SiteFooter";
import { HOMEPAGE_DATA } from "@/components/home/data";

export const metadata = {
  title: "Alumni Network — NIT Durgapur",
  description: "Connect, grow, and give back — the alumni advantage.",
};

export default function Page() {
  const d = HOMEPAGE_DATA;
  return (
    <main className="min-h-[100dvh] bg-background text-foreground">
      {/* Announcement */}
      {d.announcement?.enabled && (
        <AnnouncementBar
          text={d.announcement.text}
          ctaLabel={d.announcement.cta.label}
          ctaHref={d.announcement.cta.href}
        />
      )}

      {/* Hero */}
      <Hero
        headline={d.hero.headline}
        subtext={d.hero.subtext}
        primary={{ label: d.hero.primary.label, href: d.hero.primary.href }}
        microProof={d.hero.microProof}
      />

      {/* Brand strip */}
      <BrandStrip caption={d.brands.caption} brands={d.brands.items} />

      {/* Value grid */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ValueGrid
            heading={d.valuesSection.heading}
            subheading={d.valuesSection.subheading}
            items={d.valuesSection.items}
          />
        </div>
      </section>

      {/* Quick actions */}
      <section className="py-8 sm:py-12  min-w-dvh">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <QuickActions
            heading={d.quickActionsSection.heading}
            subheading={d.quickActionsSection.subheading}
            items={d.quickActionsSection.items}
          />
        </div>
      </section>
      {/* Spotlight */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Spotlight
            heading={d.spotlightSection.heading}
            subheading={d.spotlightSection.subheading}
            event={d.spotlightSection.event}
          />
        </div>
      </section>

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

      {/* How it works */}
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
