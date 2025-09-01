// components/home/HowItWorks.tsx
import * as React from "react";
import { Card } from "@/components/ui/card";
import type { HowStepItem } from "./types";

type Props = {
  heading: string;
  subheading: string;
  steps: ReadonlyArray<HowStepItem>;
};

export default function HowItWorks({ heading, subheading, steps }: Props) {
  return (
    <section aria-labelledby="how-heading" className="space-y-8">
      {/* Section header */}
      <header className="space-y-2 text-center">
        <h2 id="how-heading" className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {heading}
        </h2>
        <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground">
          {subheading}
        </p>
      </header>

      {/* Steps */}
      <ol className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* connector line (desktop) */}
        <span
          aria-hidden="true"
          className="hidden md:block absolute left-0 right-0 top-[38px] mx-8 h-px bg-border"
        />
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <li key={`${s.title}-${idx}`} className="relative">
              <Card className="h-full rounded-2xl border bg-card/80 backdrop-blur-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span
                      className="absolute -top-2 -right-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold"
                      aria-label={`Step ${idx + 1}`}
                    >
                      {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium">{s.title}</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </Card>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
