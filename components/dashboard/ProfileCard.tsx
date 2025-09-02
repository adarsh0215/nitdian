// components/dashboard/ProfileCard.tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

function Chip({
  children,
  tone = "slate",
}: React.PropsWithChildren<{ tone?: "green" | "amber" | "slate" }>) {
  const toneMap = {
    green:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-100",
    amber:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-100",
    slate:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800/60 dark:bg-slate-900/20 dark:text-slate-200",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border ${toneMap[tone]}`}>
      {children}
    </span>
  );
}

export default function ProfileCard({ profile }: { profile: Profile }) {
  const name = profile.full_name ?? "Your profile";
  const line1 = [profile.degree, profile.branch, profile.graduation_year]
    .filter(Boolean)
    .join(" • ");
  const line2 =
    profile.company || profile.designation
      ? [profile.designation, profile.company].filter(Boolean).join(" @ ")
      : [profile.city, profile.country].filter(Boolean).join(", ");

  const topInterests = (profile.interests ?? []).slice(0, 3);
  const approved = !!profile.is_approved;

  return (
    <Card className="rounded-2xl">
      <CardHeader className="p-5 pb-3 flex items-center justify-between">
        <CardTitle className="text-base font-semibold">Profile</CardTitle>
        <div className="flex gap-2">
          <Chip tone={approved ? "green" : "amber"}>
            {approved ? "Approved" : "Pending"}
          </Chip>
          <Chip tone={profile.is_public ? "slate" : "amber"}>
            {profile.is_public ? "Public" : "Private"}
          </Chip>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={name}
              src={profile.avatar_url}
              className={`h-14 w-14 rounded-full object-cover border ${
                approved ? "ring-2 ring-green-500/60" : ""
              }`}
            />
          ) : (
            <div
              className={`h-14 w-14 rounded-full grid place-items-center border bg-muted text-lg font-semibold ${
                approved ? "ring-2 ring-green-500/60" : ""
              }`}
            >
              {(name || "?").slice(0, 1).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="font-medium truncate">{name}</div>
            {line1 ? (
              <div className="text-sm text-muted-foreground truncate">{line1}</div>
            ) : null}
            {line2 ? (
              <div className="text-sm text-muted-foreground truncate">{line2}</div>
            ) : null}
          </div>
        </div>

        {topInterests.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {topInterests.map((t) => (
              <span key={t} className="text-[11px] rounded-full border px-2 py-0.5">
                {t}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex gap-2 pt-1">
          <Button asChild variant="outline" size="sm">
            <Link href="/onboarding">Edit profile</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/directory">Find alumni</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
