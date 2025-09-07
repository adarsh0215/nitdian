// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Section from "@/components/dashboard/ui/Section";
import SuggestionCard from "@/components/dashboard/SuggestionCard";
import ProfileCard from "@/components/dashboard/ProfileCard";
import ProfileCompletionCard from "@/components/dashboard/ProfileCompletionCard";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default async function DashboardPage() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  // parallel fetch
  const profilePromise = sb
    .from("profiles")
    .select(
      "id, full_name, onboarded, is_approved, is_public, degree, branch, city, country, graduation_year, company, designation, interests, avatar_url"
    )
    .eq("id", user.id)
    .maybeSingle();


  const [{ data: profile }] = await Promise.all([
    profilePromise
  ]);

  if (!profile?.onboarded) redirect("/onboarding");
  const isApproved = !!profile?.is_approved;

  // ---- Suggestions: strict AND filters, exclude self ----
  let sQuery = sb
    .from("profiles")
    .select("id, full_name, avatar_url, branch, graduation_year, company")
    .eq("is_public", true)
    .eq("is_approved", true)
    .neq("id", user.id); // 🚫 exclude my own profile

  if (profile?.graduation_year != null)
    sQuery = sQuery.eq("graduation_year", profile.graduation_year);
  // if (profile?.branch) sQuery = sQuery.eq("branch", profile.branch);
  // if (profile?.degree) sQuery = sQuery.eq("degree", profile.degree);

  const { data: strictMatches } = await sQuery;

  // Fallback: same graduation year only (still excludes me). No random recent feed.
  let suggestions = strictMatches ?? [];
  if (suggestions.length === 0) {
    const { data: yearOnly } = await sb
      .from("profiles")
      .select("id, full_name, avatar_url, branch, graduation_year, company")
      .eq("is_public", true)
      .eq("is_approved", true)
      .neq("id", user.id) // 🚫 exclude me here too
      .eq("graduation_year", profile?.graduation_year ?? -1);
    // .limit(6);
    suggestions = yearOnly ?? [];
  }

  // Final defensive cleanup: de-dupe and exclude me (just in case)
  const cleanSuggestions = Array.from(
    new Map(
      (suggestions ?? []).filter((p) => p?.id !== user.id).map((p) => [p.id, p])
    ).values()
  );

  // const essentialsMissing =
  //   !profile?.full_name ||
  //   !profile?.graduation_year ||
  //   !profile?.degree ||
  //   !profile?.branch ||
  //   !(profile?.interests && profile.interests.length > 0);

  // Count total batchmates by year (exclude me; only approved & public)
  const { count: batchmateCount } = await sb
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_public", true)
    .eq("is_approved", true)
    .neq("id", user.id)
    .eq("graduation_year", profile?.graduation_year ?? -1);

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      {!isApproved ? (
        <div className="rounded-xl border border-yellow-300/50 bg-yellow-50 text-yellow-900 p-3 text-sm flex items-center gap-2 dark:bg-yellow-950/30 dark:text-yellow-100">
          <AlertCircle className="h-4 w-4" />
          Your profile is pending approval. You can still edit your Profile.
          {/* {isAdmin ? (
            <span className="ml-auto text-xs opacity-80">
              (You’re admin—use Admin → Approvals)
            </span>
          ) : null} */}
        </div>
      ) : null}

      <div className="">
        <ProfileCard profile={profile} />
        {/* {essentialsMissing ? <ProfileCompletionCard profile={profile} /> : null} */}
      </div>

      {isApproved ? (
        <div className="grid gap-6">
          {/* Main column */}
          <div className="space-y-4 lg:col-span-2">
            <Section
              title={`My Batchmates${
                typeof batchmateCount === "number" ? ` (${batchmateCount})` : ""
              }`}
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
                        /* pass rich fields instead of meta so the card formats them properly */
                        branch={p.branch ?? undefined} // "Mechanical Engineering" → (cleaned to) "Mechanical"
                        // designation={p.designation ?? undefined}  // optional
                        company={p.company ?? undefined} // optional
                        // city={p.city ?? undefined}                // optional
                        // country={p.country ?? undefined}          // optional
                        /* meta is now unnecessary (fallback only) */
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

            {/* <JobsWidget jobs={_jobs ?? []} isApproved={isApproved} /> */}
          </div>
        </div>
      ) : null}
    </main>
  );
}
