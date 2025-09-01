import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Final homepage banner CTA */
export default function JoinCta({
  headline,
  subheading,
  cta,
}: {
  headline: string;
  subheading?: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl border bg-primary text-primary-foreground px-6 py-12 sm:px-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {headline}
        </h2>
        {subheading ? (
          <p className="text-primary-foreground/90">{subheading}</p>
        ) : null}
        <Button asChild size="lg" variant="secondary" className="mt-4">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      </div>

      {/* subtle decorative gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary-foreground/10 blur-3xl"
      />
    </div>
  );
}
