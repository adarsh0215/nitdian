import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QuickActionItem } from "./types";

/** Premium quick actions: equal-height cards, icon badge, stronger contrast, large tap target. */
export default function QuickActions({
  heading,
  subheading,
  items,
}: {
  heading: string;
  subheading: string;
  items: QuickActionItem[];
}) {
  return (
    <div className="space-y-8">
      {/* Section heading */}
      <div className="text-center mx-auto max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{heading}</h2>
        <p className="mt-2 text-muted-foreground">{subheading}</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr">
        {items.map((qa) => {
          const Icon = qa.icon;
          return (
            <Card
              key={qa.title}
              className="group flex flex-col h-full rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm transition
                         hover:shadow-lg hover:border-border"
            >
              <CardHeader className="gap-3">
                {/* Icon badge */}
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl 
                                bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Icon className="h-4 w-4" />
                </div>

                <CardTitle className="text-lg">{qa.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {qa.description}
                </CardDescription>
              </CardHeader>

              <CardFooter className="mt-auto px-6 pb-6">
                {/* Large tap target; full width on mobile */}
                <Button asChild size="sm" variant="outline" className="w-full sm:w-auto border-foreground/20">
                  <Link href={qa.href}>
                    {qa.cta}
                    <span
                      aria-hidden
                      className="ml-1 inline-block transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </Button>
              </CardFooter>

              {/* Subtle focus/hover ring */}
              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-border/80 transition" />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
