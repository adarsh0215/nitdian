import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function AnnouncementBar({
text,
ctaLabel,
ctaHref,
}: {
text: string;
ctaLabel: string;
ctaHref: string;
}) {
return (
<div className="w-full bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/40 border-b border-border">
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4 text-sm">
<p className="truncate">
<span className="font-medium">{text}</span>
{" "}
<Link className="underline hover:no-underline" href={ctaHref}>
{ctaLabel}
</Link>
</p>
{/* Dismiss (non-functional stub; wire later) */}
<Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Dismiss announcement">
<X className="h-4 w-4" />
</Button>
</div>
</div>
);
}