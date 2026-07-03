// app/page.tsx (Homepage)
import Hero from "@/components/home/Hero";
import BrandStrip from "@/components/home/BrandStrip";
import ValueGrid from "@/components/home/ValueGrid";
import Testimonials from "@/components/home/Testimonials";
import HowItWorks from "@/components/home/HowItWorks";
import JoinCta from "@/components/home/JoinCta";
import SiteFooter from "@/components/home/SiteFooter";
import Featured from "@/components/home/Featured";
import { HOMEPAGE_DATA } from "@/components/home/data";
import ImageTicker from "@/components/home/ImageTicker";
import GalleryCarousel from "@/components/home/GalleryCarousel";

export const metadata = {
  title: "NITDIAN",
  description: "Connect, grow, and give back — the alumni advantage.",
};

export default function Page() {
  const d = HOMEPAGE_DATA;

  return (
    <main className="min-h-[100dvh] bg-background text-foreground">
      {/* Hero */}
      <Hero
        headline={d.hero.headline}
        subtext={d.hero.subtext}
        primary={{ label: d.hero.primary.label, href: d.hero.primary.href }}
        microProof={d.hero.microProof}
      />

      {/* Brand strip: logos / partner strip directly under hero */}
      <BrandStrip caption={d.brands.caption} brands={d.brands.items} />

      {/* Gallery Section */}
      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-3">Alumni Moments – Delhi Chapter Meet 2026</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A glimpse into the unforgettable alumni gathering held on 22nd
              February 2026.
            </p>
          </div>

          {/* Appreciation Message Card */}
          <div className="bg-card border border-border rounded-3xl p-8 md:p-10 mb-16 shadow-sm">
            <div className="max-w-3xl mx-auto text-card-foreground leading-relaxed space-y-5">
              <p className="font-medium">Dear NITDIANs / RECOLIONs,</p>

              <p className="text-muted-foreground">
                There was an outstanding alumni participation along with their
                family members in the alumni event organised by NITDian Delhi
                chapter alumni association on 22nd February 2026.
              </p>

              <p className="text-muted-foreground">
                It was heartening to see many alumni joining for the first time,
                especially younger alumni of the batches 2020 and beyond.
                Together, we celebrated our bonds in lively interactions and
                inspiring talks filled with energy and enthusiasm, about the
                alumni achievements during the recent past, that turned the meet
                into lasting memories.
              </p>

              <p className="text-muted-foreground">
                More than a hundred alumni and their families who attended,
                deserve special appreciation.
              </p>

              <div className="pt-6 border-t border-border text-sm">
                <p className="text-muted-foreground">With sincere thanks,</p>
                <p className="mt-2">🙏</p>
                <p className="font-medium mt-2">Sandeep Kapoor</p>
                <p className="text-muted-foreground">President</p>
              </div>
            </div>
          </div>

          <GalleryCarousel />
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

      {/* Image ticker for alumni moments */}
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
