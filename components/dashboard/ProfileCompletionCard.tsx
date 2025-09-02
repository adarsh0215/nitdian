// components/dashboard/ProfileCompletionCard.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Profile = {
  full_name?: string | null;
  avatar_url?: string | null;
  city?: string | null;
  country?: string | null;
  graduation_year?: number | null;
  degree?: string | null;
  branch?: string | null;
  company?: string | null;
  designation?: string | null;
  interests?: string[] | null;
};

export default function ProfileCompletionCard({ profile }: { profile: Profile }) {
  const required: Array<[keyof Profile, string]> = [
    ["full_name", "Name"],
    ["graduation_year", "Graduation year"],
    ["degree", "Degree"],
    ["branch", "Branch"],
    ["interests", "Areas of interest"],
  ];
  const missing = required.filter(([k]) => {
    const v = profile[k];
    if (Array.isArray(v)) return v.length === 0;
    return !v;
  });
  const total = required.length;
  const done = total - missing.length;
  const pct = Math.round((done / total) * 100);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="p-5 pb-3">
        <CardTitle>Profile completeness</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-3">
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          />
        </div>
        {missing.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              Complete the remaining fields to unlock the best experience:
            </p>
            <ul className="text-sm list-disc pl-5">
              {missing.map(([, label]) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
            <div className="pt-2">
              <Button asChild size="sm">
                <Link href="/onboarding">Update profile</Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Nice! Your profile looks complete.</p>
        )}
      </CardContent>
    </Card>
  );
}
