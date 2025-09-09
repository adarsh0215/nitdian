// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Section from "@/components/dashboard/ui/Section";
import SuggestionCard from "@/components/dashboard/SuggestionCard";
import ProfileCard from "@/components/dashboard/ProfileCard";
import ProfileCompletionCard from "@/components/dashboard/ProfileCompletionCard";
import { AlertCircle } from "lucide-react";
import EventSection from "@/components/home/EventSection"; // <- new import

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

  const [{ data: profile }] = await Promise.all([profilePromise]);

  if (!profile?.onboarded) redirect("/onboarding");
  const isApproved = !!profile?.is_approved;

  // ---- Suggestions: strict AND filters, exclude self ----
  let sQuery = sb
    .from("profiles")
    .select("id, full_name, avatar_url, branch, graduation_year, company")
    .eq("is_public", true)
    .eq("is_approved", true)
    .neq("id", user.id);

  if (profile?.graduation_year != null)
    sQuery = sQuery.eq("graduation_year", profile.graduation_year);

  const { data: strictMatches } = await sQuery;

  let suggestions = strictMatches ?? [];
  if (suggestions.length === 0) {
    const { data: yearOnly } = await sb
      .from("profiles")
      .select("id, full_name, avatar_url, branch, graduation_year, company")
      .eq("is_public", true)
      .eq("is_approved", true)
      .neq("id", user.id)
      .eq("graduation_year", profile?.graduation_year ?? -1);
    suggestions = yearOnly ?? [];
  }

  const cleanSuggestions = Array.from(
    new Map(
      (suggestions ?? []).filter((p) => p?.id !== user.id).map((p) => [p.id, p])
    ).values()
  );

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
        </div>
      ) : null}

      {/* Responsive 2-column grid on large screens, single column on mobile.
          items-stretch ensures both cards have consistent height. */}
      <div className="grid gap-6 lg:grid-cols-2 items-stretch">
        <div className="h-full">
          <EventSection
            title="Shri Shankracharya Ji Maharaj at NIT Durgapur"
            subtitle="Motivational Speech on "
            dates={[
              { date: "10 Sept 2025", times: "  5:00 PM" },
              
            ]}
            ctaHref="https://www.youtube.com/live/RQ1jRAJV1fg"
            ctaLabel="Watch live"
            
          />
        </div>

        <div className="h-full">
          <ProfileCard profile={profile} />
          {/* {essentialsMissing ? <ProfileCompletionCard profile={profile} /> : null} */}
        </div>
      </div>

      {isApproved ? (
        <div className="grid gap-6">
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
    </main>
  );
}
