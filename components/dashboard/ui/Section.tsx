// components/dashboard/ui/Section.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Section({
  title,
  cta,
  children,
}: React.PropsWithChildren<{ title: string; cta?: React.ReactNode }>) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="p-5 pb-3 flex items-center justify-between">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {cta ? <div className="shrink-0">{cta}</div> : null}
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}
