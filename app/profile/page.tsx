// app/profile/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import ProfileForm from "@/components/profile/ProfileForm";
import {
  toFormDefaults,
  type OnboardingValues,
} from "@/lib/validation/onboarding";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
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
  interests: string[] | null; // keep as strings to match OnboardingValues
  consent_directory_visible: boolean | null;
  consent_directory_show_contacts: boolean | null;
  avatar_url: string | null;
};

function toProfileDefaults(profile: ProfileRow | null, emailFallback: string): OnboardingValues {
  const base = toFormDefaults(emailFallback);

  if (!profile) {
    // On first load (no profile row yet) we still need all required fields present.
    return {
      ...base,
      consent_terms_privacy: true, // not shown on profile, but schema needs it
    };
  }

  return {
    ...base,
    full_name: profile.full_name ?? base.full_name,
    email: profile.email ?? base.email,
    phone_e164: profile.phone_e164 ?? base.phone_e164,
    city: profile.city ?? base.city,
    country: profile.country ?? base.country,
    graduation_year: profile.graduation_year ?? base.graduation_year,
    degree: (profile.degree as OnboardingValues["degree"]) ?? base.degree,
    branch: (profile.branch as OnboardingValues["branch"]) ?? base.branch,
    roll_number: profile.roll_number ?? base.roll_number,
    employment_type:
      (profile.employment_type as OnboardingValues["employment_type"]) ??
      base.employment_type,
    company: profile.company ?? base.company,
    designation: profile.designation ?? base.designation,
    interests: (profile.interests as OnboardingValues["interests"]) ?? base.interests,
    consent_directory_visible:
      profile.consent_directory_visible ?? base.consent_directory_visible,
    consent_directory_show_contacts:
      profile.consent_directory_show_contacts ?? base.consent_directory_show_contacts,
    // We don't show Terms checkbox on Profile; keep it true so schema passes.
    consent_terms_privacy: true,
    avatar_url: profile.avatar_url ?? base.avatar_url,
  };
}

export default async function ProfilePage() {
  const supabase = await supabaseServer();

  // 1) Require auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  // 2) Load current profile row
  const { data } = await supabase
    .from("profiles")
    .select(
      [
        "id",
        "email",
        "full_name",
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
        "consent_directory_visible",
        "consent_directory_show_contacts",
        "avatar_url",
      ].join(",")
    )
    .eq("id", user.id)
    .maybeSingle();

  const profile = (data as unknown as ProfileRow | null) ?? null;

  const defaults = toProfileDefaults(profile, user.email ?? "");

  return <ProfileForm userId={user.id} defaults={defaults} />;
}
