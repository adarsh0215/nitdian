// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import supabaseAdmin from "@/lib/supabase/admin";
import { getApprovalScope, type ApprovalScope } from "@/lib/privileges";
import { Button } from "@/components/ui/button";
import Section from "@/components/dashboard/ui/Section";
import SuggestionCard from "@/components/dashboard/SuggestionCard";
import ProfileCard from "@/components/dashboard/ProfileCard";
import { AlertCircle } from "lucide-react";
import PendingListClient from "@/components/PendingListClient";
import EventCard from "@/components/home/EventSection";

export default async function DashboardPage() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await sb
    .from("profiles")
    .select(
      "id, full_name, onboarded, is_approved, is_public, degree, branch, city, country, graduation_year, company, designation, interests, avatar_url, email",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarded) redirect("/onboarding");
  const isApproved = !!profile.is_approved;

  // ---------------- Suggestions & batchmates ----------------
  const { data: suggestions } = await sb
    .from("profiles")
    .select("id, full_name, avatar_url, branch, graduation_year, company")
    .eq("is_public", true)
    .eq("is_approved", true)
    .neq("id", user.id)
    .eq("graduation_year", profile.graduation_year);

  const cleanSuggestions = Array.from(
    new Map((suggestions ?? []).map((p) => [p.id, p])).values(),
  );

  const { count: batchmateCount } = await sb
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_public", true)
    .eq("is_approved", true)
    .neq("id", user.id)
    .eq("graduation_year", profile.graduation_year);

  // ---------------- Pending approvals (approvers only) ----------------
  const approverEmail = profile.email ?? user.email;
  let scope: ApprovalScope = { kind: "none" };
  if (approverEmail) {
    try {
      scope = await getApprovalScope(approverEmail);
    } catch (e) {
      console.error("/dashboard: approval scope error:", e); // fail safe: show none
    }
  }

  let pendingQuery = supabaseAdmin
    .from("profiles")
    .select(
      "id, full_name, avatar_url, branch, graduation_year, degree, city, country, designation, company",
    )
    .eq("status", "PENDING")
    .eq("is_approved", false)
    .order("created_at", { ascending: false })
    .limit(50);
  if (scope.kind === "batch") {
    pendingQuery = pendingQuery.in("graduation_year", scope.years);
  }

  let initialPending: NonNullable<Awaited<typeof pendingQuery>["data"]> = [];
  if (scope.kind !== "none") {
    const { data, error } = await pendingQuery;
    if (error) console.error("/dashboard: pending fetch error:", error);
    initialPending = data ?? [];
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      {!isApproved ? (
        <div className="rounded-xl border border-yellow-300/50 bg-yellow-50 text-yellow-900 p-3 text-sm flex items-center gap-2 dark:bg-yellow-950/30 dark:text-yellow-100">
          <AlertCircle className="h-4 w-4" />
          Your profile is pending approval. You can still edit your Profile.
        </div>
      ) : null}

      {/* Responsive layout: stacked on mobile, 2/3 + 1/3 on desktop */}
      <div className="grid gap-8 lg:grid-cols-3">
        <EventCard variant="compact" />
        <div className="lg:col-span-1">
          <ProfileCard profile={profile} />
        </div>
      </div>

      {isApproved ? (
        <div className="grid gap-6">
          <div className="space-y-4 lg:col-span-2">
            <Section
              title={`My Batchmates${typeof batchmateCount === "number" ? ` (${batchmateCount})` : ""}`}
              cta={
                <Button asChild size="sm" variant="outline">
                  <Link href="/directory">Open directory for Details</Link>
                </Button>
              }
            >
              {cleanSuggestions.length > 0 ? (
                <ul
                  className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3"
                  role="list"
                >
                  {cleanSuggestions.map((p) => (
                    <li key={p.id}>
                      <SuggestionCard
                        href="/directory"
                        name={p.full_name ?? "Alumni"}
                        avatar={p.avatar_url}
                        branch={p.branch ?? undefined}
                        company={p.company ?? undefined}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                  No other Alumni of your Batch has registered so far.
                </div>
              )}
            </Section>
          </div>
        </div>
      ) : null}

      {initialPending.length > 0 ? (
        <div className="space-y-4 lg:col-span-2">
          <Section title={`Pending Approvals (${initialPending.length})`} cta={null}>
            <PendingListClient initialPending={initialPending} />
          </Section>
        </div>
      ) : null}
    </main>
  );
}
