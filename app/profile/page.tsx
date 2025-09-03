// app/profile/page.tsx
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import ProfileForm from "@/components/profile/ProfileForm";
import type { OnboardingValues } from "@/lib/validation/onboarding";

export const metadata = { title: "Profile" };

type ProfileRow = {
  full_name: string | null;
  email: string | null;
  phone_e164: string | null;
  city: string | null;
  country: string | null;
  graduation_year: number | null;
  degree: string | null;
  branch: string | null;
  roll_number: string | null;
  employment_type: string | null;
  company: string | null;
  designation: string | null;
  interests: number[] | null; // stored as numeric indices in DB
  avatar_url: string | null;
  consent_directory_visible: boolean | null;
  consent_directory_show_contacts: boolean | null;
};

export default async function ProfilePage() {
  noStore();

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // ✅ Do NOT add a generic to `.select<...>()`. Just select fields and cast after.
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select(
      [
        "full_name",
        "email",
        "phone_e164",
        "city",
        "country",
        "graduation_year",
        "degree",
        "branch",
        "roll_number",
        "employment_type",
        "company",
        "designation",
        "interests",
        "avatar_url",
        "consent_directory_visible",
        "consent_directory_show_contacts",
      ].join(",")
    )
    .eq("id", user.id)
    .maybeSingle();

  const profile = (profileRaw ?? null) as ProfileRow | null;

  // Map numeric interest IDs -> form's string union
  const INTEREST_LABELS = [
    "Networking, Business & Services",
    "Mentorship & Guidance",
    "Jobs & Internships",
    "Exclusive Member Benefits",
    "Community Activities",
    "Nostalgia & Updates",
  ] as const;
  type InterestUnion = (typeof INTEREST_LABELS)[number];

  const interests: InterestUnion[] = (profile?.interests ?? [])
    .map((i) => INTEREST_LABELS[i as number])
    .filter((v): v is InterestUnion => Boolean(v));

  // ✅ Defaults must exactly match OnboardingValues expected by reused field components
  const defaults: OnboardingValues = {
    full_name: profile?.full_name ?? "",
    email: profile?.email ?? user.email ?? "",
    phone_e164: profile?.phone_e164 ?? "",
    city: profile?.city ?? "",
    country: (profile?.country ?? undefined) as OnboardingValues["country"],
    graduation_year: (profile?.graduation_year ?? undefined) as OnboardingValues["graduation_year"],
    degree: (profile?.degree ?? undefined) as OnboardingValues["degree"],
    branch: (profile?.branch ?? undefined) as OnboardingValues["branch"],
    roll_number: profile?.roll_number ?? "",
    employment_type: (profile?.employment_type ??
      undefined) as OnboardingValues["employment_type"],
    company: profile?.company ?? "",
    designation: profile?.designation ?? "",
    interests, // now string union
    consent_directory_visible: Boolean(profile?.consent_directory_visible ?? false),
    consent_directory_show_contacts: Boolean(profile?.consent_directory_show_contacts ?? false),
    consent_terms_privacy: true, // keep this so Control<OnboardingValues> matches
    avatar_url: profile?.avatar_url ?? undefined,
  };

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <ProfileForm userId={user.id} defaults={defaults} />
    </div>
  );
}
