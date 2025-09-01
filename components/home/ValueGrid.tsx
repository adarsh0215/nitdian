import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type ValueItem = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export default function ValueGrid({
  heading,
  subheading,
  items,
}: {
  heading: string;
  subheading: string;
  items: ValueItem[];
}) {
  return (
    <div className="space-y-8">
      {/* Section Heading */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {heading}
        </h2>
        <p className="mt-2 text-muted-foreground">{subheading}</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Card key={it.title} className="h-full">
              <CardHeader className="space-y-2">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{it.title}</CardTitle>
                <CardDescription>{it.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
