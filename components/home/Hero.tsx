import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";

export default function Hero({
  headline,
  subtext,
  primary,
  microProof,
}: {
  headline: string;
  subtext: string;
  primary: { label: string; href: string };
  microProof: string;
}) {
  return (
    <section className="relative isolate">
      {/* Background image */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/hero-campus.jpg" // background image
          alt="" // decorative; empty alt so screen readers skip
          fill
          priority
          className="object-cover object-center scale-105 blur-[2px] md:blur-[1.5px]"
        />
        {/* Overlay layers for contrast */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-nlack/20 to-black/20" />
      </div>

      {/* Foreground content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="min-h-[68svh] md:min-h-[78vh] xl:min-h-[92vh] flex items-center justify-center py-14 sm:py-20 md:py-24">
          <div className="max-w-3xl text-center">
            {/* Optional badge for microProof (currently commented out) */}
            {/* <Badge className="mb-6 px-2 rounded-full text-sm bg-background text-primary">{microProof}</Badge> */}

            {/* Headline */}
            <h1 className="text-4xl text-white sm:text-6xl font-semibold tracking-tight mb-4">
              {headline}
            </h1>

            {/* Subtext */}
            <p className="text-base text-[#EAEAEA] sm:text-lg mb-8">{subtext}</p>

            {/* Call-to-actions */}
            <div className="flex flex-row items-center justify-center gap-3">
              {/* Primary button */}
              <Button asChild size="lg">
                <Link href={primary.href}>{primary.label}</Link>
              </Button>

              {/* Secondary button (Login) */}
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}