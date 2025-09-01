import Link from "next/link";
import type { FooterLink } from "./types";


export default function SiteFooter({
linksLeft,
linksRight,
socials,
note,
}: {
linksLeft: FooterLink[];
linksRight: FooterLink[];
socials: FooterLink[];
note: string;
}) {
return (
<footer className="border-t border-border mt-12">
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
<nav className="space-y-2">
{linksLeft.map((l) => (
<Link key={l.label} className="block text-sm text-muted-foreground hover:text-foreground" href={l.href}>{l.label}</Link>
))}
</nav>
<nav className="space-y-2">
{linksRight.map((l) => (
<Link key={l.label} className="block text-sm text-muted-foreground hover:text-foreground" href={l.href}>{l.label}</Link>
))}
</nav>
<div className="space-y-2">
<div className="flex gap-4">
{socials.map((s) => (
<Link key={s.label} className="text-sm text-muted-foreground hover:text-foreground" href={s.href}>{s.label}</Link>
))}
</div>
<p className="text-xs text-muted-foreground">{note}</p>
</div>
</div>
</div>
</footer>
);
}