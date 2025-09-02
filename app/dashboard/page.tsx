// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Section from "@/components/dashboard/ui/Section";
import SuggestionCard from "@/components/dashboard/SuggestionCard";
import JobsWidget from "@/components/dashboard/JobsWidget";
import ProfileCard from "@/components/dashboard/ProfileCard";
import ProfileCompletionCard from "@/components/dashboard/ProfileCompletionCard";

function orJoin(parts: string[]) {
  return parts.filter(Boolean).join(",");
}

export default async function DashboardPage() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  // parallel fetch
  const profilePromise = sb
    .from("profiles")
    .select("id, full_name, onboarded, is_approved, is_public, degree, branch, city, country, graduation_year, company, designation, interests, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const jobsPromise = sb
    .from("jobs")
    .select("id, title, company, location, employment_type, experience_level, apply_url, has_alumni_referral, tags, created_at")
    .eq("status", "published")
    .order("has_alumni_referral", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  const [{ data: profile }, { data: jobs }] = await Promise.all([profilePromise, jobsPromise]);

  if (!profile?.onboarded) redirect("/onboarding");
  const isApproved = !!profile?.is_approved;

  // lightweight “people you may know”
  const or = orJoin([
    profile?.branch ? `branch.eq.${encodeURIComponent(profile.branch)}` : "",
    profile?.graduation_year ? `graduation_year.eq.${profile.graduation_year}` : "",
    profile?.city ? `city.eq.${encodeURIComponent(profile.city)}` : "",
  ]);

  const { data: suggestionsRaw } = await sb
    .from("profiles")
    .select("id, full_name, avatar_url, branch, graduation_year, company")
    .eq("is_public", true)
    .eq("is_approved", true)
    .neq("id", user.id)
    .or(or || "branch.eq.__none__")
    .limit(6);

  const suggestions = suggestionsRaw && suggestionsRaw.length > 0
    ? suggestionsRaw
    : (await sb
        .from("profiles")
        .select("id, full_name, avatar_url, branch, graduation_year, company, created_at")
        .eq("is_public", true)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(6)
      ).data ?? [];

  const essentialsMissing =
    !profile?.full_name ||
    !profile?.graduation_year ||
    !profile?.degree ||
    !profile?.branch ||
    !(profile?.interests && profile.interests.length > 0);

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      {!isApproved ? (
        <div className="rounded-2xl border border-yellow-300/50 bg-yellow-50 text-yellow-900 p-3 text-sm dark:bg-yellow-950/30 dark:text-yellow-100">
          Your profile is pending approval. You can still edit your profile and browse jobs.
        </div>
      ) : null}

      {/* Welcome (two concise actions) */}
      <Section
        title={`Welcome${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋`}
        cta={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/onboarding">Edit profile</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Pick up where you left off, discover people you may know, and see the latest jobs.
        </p>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Section
            title="People you may know"
            cta={
              <Button asChild size="sm" variant="outline">
                <Link href="/directory">Open directory</Link>
              </Button>
            }
          >
            {suggestions.length > 0 ? (
              <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <SuggestionCard
                      name={p.full_name ?? "Alumni"}
                      avatar={p.avatar_url}
                      meta={[p.branch, p.graduation_year, p.company].filter(Boolean).join(" • ")}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                No suggestions yet.
              </div>
            )}
          </Section>

          <JobsWidget jobs={jobs ?? []} isApproved={isApproved} />
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <ProfileCard profile={profile} />
          {essentialsMissing ? <ProfileCompletionCard profile={profile} /> : null}
          {/* Quick actions removed (duplicative); the welcome CTA already covers them */}
        </div>
      </div>
    </main>
  );
}
