// components/dashboard/JobsWidget.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLink, Briefcase } from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employment_type: string | null;
  experience_level: string | null;
  apply_url: string;
  has_alumni_referral: boolean;
  tags: string[] | null;
  created_at: string;
};

export default function JobsWidget({
  jobs,
  isApproved,
}: {
  jobs: Job[];
  isApproved: boolean;
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="p-5 pb-3 flex items-center justify-between">
        <CardTitle className="text-base font-semibold">Latest jobs</CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/jobs">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-5 space-y-2">
        {jobs.length === 0 ? (
          <div className="rounded-xl border p-4 text-sm text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              No jobs yet.
            </span>
            <Button asChild size="sm" disabled={!isApproved}>
              <Link href={isApproved ? "/jobs/new" : "#"}>Post a job</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {jobs.map((j) => (
              <li
                key={j.id}
                className="rounded-xl border p-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{j.title}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {j.company}
                    {j.location ? ` • ${j.location}` : ""}
                    {j.employment_type ? ` • ${j.employment_type}` : ""}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {j.has_alumni_referral ? (
                      <span className="text-[10px] rounded-full border px-2 py-0.5">
                        Alumni referral
                      </span>
                    ) : null}
                    {j.tags?.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] rounded-full border px-2 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <a href={j.apply_url} target="_blank" rel="noreferrer">
                    Apply <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
