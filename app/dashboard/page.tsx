// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server"; // server-side supabase that uses cookies()
import supabaseAdmin from "@/lib/supabase/admin"; // admin client (service role / anon) used for db reads
import { Button } from "@/components/ui/button";
import Section from "@/components/dashboard/ui/Section";
import SuggestionCard from "@/components/dashboard/SuggestionCard";
import ProfileCard from "@/components/dashboard/ProfileCard";
// removed unused import: ProfileCompletionCard
import { AlertCircle } from "lucide-react";
import EventSection from "@/components/home/EventSection"; // <- new import

// Pending list client component (client-side) that accepts `initialPending` prop.
// Make sure this file exists at components/PendingListClient.tsx
import PendingListClient from "@/components/PendingListClient";

type MemberMembershipRow = {
  membership_type: string;
  start_date?: string | null;
  end_date?: string | null;
  params?: unknown;
};

type PrivilegeRow = {
  membership_type: string;
  privilege: string;
  execute: boolean;
};

type ProfileRow = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  branch?: string | null;
  graduation_year?: number | string | null;
  company?: string | null;
  degree?: string | null;
  city?: string | null;
  country?: string | null;
  designation?: string | null;
  status?: string | null;
  is_approved?: boolean | null;
  email?: string | null;
  created_at?: string | null;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function safeParseJSON<T = unknown>(value: unknown): T | null {
  if (value === null || value === undefined || value === "") return null;
  try {
    if (typeof value === "string") return JSON.parse(value) as T;
    return value as T;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  // -------------- authenticate user (server-side) ----------------
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();

  // if not signed in redirect to login
  if (!user) redirect("/login");

  // ------------------ load viewer's profile (server-side) ----------------
  // We fetch the logged-in user's profile to build dashboard content
  const profilePromise = sb
    .from("profiles")
    .select(
      "id, full_name, onboarded, is_approved, is_public, degree, branch, city, country, graduation_year, company, designation, interests, avatar_url, email"
    )
    .eq("id", user.id)
    .maybeSingle();

  // run parallel reads
  const [{ data: profile }] = await Promise.all([profilePromise]);

  if (!profile?.onboarded) redirect("/onboarding");
  const isApproved = !!profile?.is_approved;

  // ---------------- Suggestions & batchmates (existing code) ----------------
  let sQuery = sb
    .from("profiles")
    .select("id, full_name, avatar_url, branch, graduation_year, company")
    .eq("is_public", true)
    .eq("is_approved", true)
    .neq("id", user.id);

  if (profile?.graduation_year != null) sQuery = sQuery.eq("graduation_year", profile.graduation_year);

  const { data: strictMatches } = await sQuery;
  let suggestions = (strictMatches ?? []) as ProfileRow[];

  if (suggestions.length === 0) {
    const { data: yearOnly } = await sb
      .from("profiles")
      .select("id, full_name, avatar_url, branch, graduation_year, company")
      .eq("is_public", true)
      .eq("is_approved", true)
      .neq("id", user.id)
      .eq("graduation_year", profile?.graduation_year ?? -1);
    suggestions = (yearOnly ?? []) as ProfileRow[];
  }

  const cleanSuggestions = Array.from(
    new Map((suggestions ?? []).filter((p) => p?.id !== user.id).map((p) => [p.id, p])).values()
  );

  const { count: batchmateCount } = await sb
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_public", true)
    .eq("is_approved", true)
    .neq("id", user.id)
    .eq("graduation_year", profile?.graduation_year ?? -1);

  // ------------------- NEW: compute pending approvals to show ------------------
  // We want server-side logic to only return profiles the approver is allowed to act on
  let initialPending: ProfileRow[] = [];

  try {
    // 1) fetch active memberships for this approver (user.email should exist)
    const approverEmail = (profile?.email ?? user.email ?? null) as string | null;

    if (approverEmail) {
      // pull recent memberships for this user_email (approximate filtering)
      const nowISO = new Date().toISOString();
      const { data: membershipsRaw, error: memErr } = await supabaseAdmin
        .from("member_memberships")
        .select("membership_type, start_date, end_date, params")
        .eq("user_email", approverEmail)
        .limit(500);

      if (memErr) {
        // log and continue — fallback: no pending shown
        console.error("/dashboard: membership lookup error:", memErr);
      } else {
        const memberships = (membershipsRaw ?? []) as MemberMembershipRow[];

        // filter to memberships that are currently active (start_date <= now && (end_date is null or end_date >= now))
        const activeMemberships = memberships.filter((m) => {
          try {
            const startsOk =
              !m.start_date || new Date(String(m.start_date)).toISOString() <= nowISO;
            const endsOk = !m.end_date || new Date(String(m.end_date)).toISOString() >= nowISO;
            return startsOk && endsOk;
          } catch {
            return false;
          }
        });

        const membershipTypes = Array.from(
          new Set(activeMemberships.map((m) => String(m.membership_type ?? "").trim()))
        ).filter(Boolean);

        if (membershipTypes.length > 0) {
          // 2) fetch privileges for these membership_types
          const { data: privilegesRaw, error: privErr } = await supabaseAdmin
            .from("membership_privilege")
            .select("membership_type, privilege, execute")
            .in("membership_type", membershipTypes)
            .limit(500);

          if (privErr) {
            console.error("/dashboard: privileges lookup error:", privErr);
          } else {
            const privileges = (privilegesRaw ?? []) as PrivilegeRow[];

            const hasApproveAll = privileges.some(
              (p) => p.privilege === "APPROVE_ONBOARD_ALL" && Boolean(p.execute)
            );
            const hasApproveBatch = privileges.some(
              (p) => p.privilege === "APPROVE_ONBOARD_BATCH" && Boolean(p.execute)
            );

            if (hasApproveAll) {
              // return top N pending profiles (all)
              const { data: pendingAll, error: pErr } = await supabaseAdmin
                .from("profiles")
                .select(
                  "id, full_name, avatar_url, branch, graduation_year, degree, city, country, designation, company"
                )
                .eq("status", "PENDING")
                .eq("is_approved", false)
                .limit(50)
                .order("created_at", { ascending: false });

              if (pErr) {
                console.error("/dashboard: fetch pending all error:", pErr);
              } else {
                initialPending = (pendingAll ?? []) as ProfileRow[];
              }
            } else if (hasApproveBatch) {
              // approver can approve only their batch: use approver's graduation_year (from profiles)
              const approverYearRaw = profile?.graduation_year ?? null;
              const approverYear = approverYearRaw !== null && approverYearRaw !== undefined ? Number(approverYearRaw) : null;

              if (approverYear !== null && !Number.isNaN(approverYear)) {
                const { data: pendingBatch, error: pErr } = await supabaseAdmin
                  .from("profiles")
                  .select(
                    "id, full_name, avatar_url, branch, graduation_year, degree, city, country, designation, company"
                  )
                  .eq("status", "PENDING")
                  .eq("is_approved", false)
                  .eq("graduation_year", approverYear)
                  .limit(50)
                  .order("created_at", { ascending: false });

                if (pErr) {
                  console.error("/dashboard: fetch pending batch error:", pErr);
                } else {
                  initialPending = (pendingBatch ?? []) as ProfileRow[];
                }
              } else {
                // no approver year known -> no batch items
                initialPending = [];
              }
            } else {
              // no privileges to approve -> show empty
              initialPending = [];
            }
          }
        } else {
          // no active memberships -> no pending approvals shown
          initialPending = [];
        }
      }
    }
  } catch (e: unknown) {
    console.error("/dashboard: error preparing pending list:", e);
    initialPending = []; // fail safe
  }

  // ---------------------- render dashboard --------------------------
  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      {!isApproved ? (
        <div className="rounded-xl border border-yellow-300/50 bg-yellow-50 text-yellow-900 p-3 text-sm flex items-center gap-2 dark:bg-yellow-950/30 dark:text-yellow-100">
          <AlertCircle className="h-4 w-4" />
          Your profile is pending approval. You can still edit your Profile.
        </div>
      ) : null}

      {/* Responsive 2-column grid on large screens, single column on mobile */}
      <div className="grid gap-6 lg:grid-cols-2 items-stretch">
        <div className="h-full">
          <EventSection
            title="Shri Shankracharya Ji Maharaj at NIT Durgapur"
            subtitle="Motivational Speech on "
            dates={[{ date: "10 Sept 2025", times: "  5:00 PM" }]}
            ctaHref="https://www.youtube.com/live/RQ1jRAJV1fg"
            ctaLabel="Watch live"
          />
        </div>

        <div className="h-full">
          <ProfileCard profile={profile as ProfileRow} />
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
                <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3" role="list">
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

      {/* ---------- NEW: Pending Approvals Section (only for approvers) ---------- */}
      {initialPending.length > 0 ? (
        <div className="space-y-4 lg:col-span-2">
          <Section title={`Pending Approvals (${initialPending.length})`} cta={null}>
            {/* Pass server-side fetched list as initialPending */}
            <PendingListClient initialPending={initialPending} />
          </Section>
        </div>
      ) : null}
    </main>
  );
}
