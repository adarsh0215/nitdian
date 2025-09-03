// components/dashboard/ProfileCard.tsx
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  Globe2,
  Lock,
  MapPin,
  Briefcase,
  GraduationCap,
} from "lucide-react";

type Profile = {
  full_name?: string | null;
  avatar_url?: string | null;
  degree?: string | null;
  branch?: string | null;
  graduation_year?: number | null;
  company?: string | null;
  designation?: string | null;
  city?: string | null;
  country?: string | null;
  is_public?: boolean | null;
  is_approved?: boolean | null;
  interests?: string[] | null;
};

function Badge({
  children,
  icon,
}: React.PropsWithChildren<{ icon?: React.ReactNode }>) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-card/60 px-2 py-[3px] text-[11px] text-muted-foreground">
      {icon ? <span className="inline-flex size-3.5 items-center justify-center">{icon}</span> : null}
      {children}
    </span>
  );
}

function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-border/60"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
    >
      <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${v}%` }} />
    </div>
  );
}

function computeCompletion(profile: Profile) {
  const checks: Array<{ key: keyof Profile; label: string; done: boolean }> = [
    { key: "full_name", label: "Name", done: !!profile.full_name?.trim() },
    { key: "avatar_url", label: "Photo", done: !!profile.avatar_url },
    { key: "degree", label: "Degree", done: !!profile.degree },
    { key: "branch", label: "Branch", done: !!profile.branch },
    { key: "graduation_year", label: "Grad year", done: !!profile.graduation_year },
    { key: "interests", label: "Interests", done: Array.isArray(profile.interests) && profile.interests.length > 0 },
    { key: "city", label: "City", done: !!profile.city },
    { key: "company", label: "Company", done: !!profile.company || !!profile.designation },
  ];
  const done = checks.filter((c) => c.done).length;
  const percent = Math.round((done / checks.length) * 100);
  const missing = checks.filter((c) => !c.done).map((c) => c.label);
  return { percent, missing };
}

export default function ProfileCard({ profile }: { profile: Profile }) {
  const name = profile.full_name?.trim() || "Your Profile";
  const approved = !!profile.is_approved;
  const isPublic = !!profile.is_public;

  const edu = [profile.degree, profile.branch, profile.graduation_year]
    .filter(Boolean)
    .join(" • ");
  const work =
    profile.company || profile.designation
      ? [profile.designation, profile.company].filter(Boolean).join(" @ ")
      : "";
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  const topInterests = (profile.interests ?? []).slice(0, 3);
  const { percent, missing } = computeCompletion(profile);

  return (
    <Card className="rounded-2xl border-muted/60">
      {/* HEADER — tight, no wasted whitespace */}
      <CardHeader className="p-4 sm:p-5">
        <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3 sm:gap-4">
          <Avatar className="size-10 sm:size-11 border">
            <AvatarImage alt={name} src={profile.avatar_url ?? ""} />
            <AvatarFallback className="text-[11px]">{initials || "?"}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="truncate text-sm font-medium tracking-tight">{name}</div>

            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              {work ? (
                <>
                  <Briefcase className="size-3.5 shrink-0" />
                  <span className="truncate">{work}</span>
                </>
              ) : (
                <>
                  <GraduationCap className="size-3.5 shrink-0" />
                  <span className="truncate">{edu || "—"}</span>
                </>
              )}
            </div>

            {location ? (
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            ) : null}
          </div>

          {/* Right-aligned actions */}
          <div className="flex items-center gap-2">
            <Badge icon={approved ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}>
              {approved ? "Approved" : "Pending"}
            </Badge>
            <Badge icon={isPublic ? <Globe2 className="size-3.5" /> : <Lock className="size-3.5" />}>
              {isPublic ? "Public" : "Private"}
            </Badge>
            <Button asChild size="sm" variant="ghost" className="h-8 px-2">
              <Link href="/profile">Edit</Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <Separator className="bg-border/60" />

      {/* BODY — compact, aligned to a tidy rhythm */}
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Profile completion</span>
          <span className="text-xs font-medium">{percent}%</span>
        </div>
        <Progress value={percent} />

        {percent < 100 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>Missing:</span>
            <span className="truncate">
              {missing.slice(0, 3).join(", ")}
              {missing.length > 3 ? "…" : ""}
            </span>
            <Button asChild variant="link" className="h-auto p-0 text-xs">
              <Link href="/profile">Complete now</Link>
            </Button>
          </div>
        )}

        {topInterests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topInterests.map((t) => (
              <span
                key={t}
                className="rounded-full border bg-card/60 px-2 py-[3px] text-[11px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
