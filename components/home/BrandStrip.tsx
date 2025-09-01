import type { Brand } from "./types";


export default function BrandStrip({ caption, brands }: { caption: string; brands: Brand[] }) {
return (
<section className="border-y border-border bg-muted/30">
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
<p className="text-sm text-muted-foreground mb-4">{caption}</p>
{/* Simple text logos for now; swap with SVGs/images later */}
<div className="flex gap-6 sm:gap-10 overflow-x-auto no-scrollbar py-1">
{brands.map((b) => (
<span key={b.name} className="whitespace-nowrap text-sm sm:text-base font-medium opacity-80">
{b.logoText ?? b.name}
</span>
))}
</div>
</div>
</section>
);
}