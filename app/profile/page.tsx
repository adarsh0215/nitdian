// app/profile/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import ProfileForm from "@/components/profile/ProfileForm";


export default async function ProfilePage() {
  const supabase = await supabaseServer();

  // Require auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch existing profile (narrow columns to what the form needs)
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      gender,
      phone_e164,
      city,
      country,
      graduation_year,
      degree,
      branch,
      roll_number,
      employment_type,
      company,
      designation,
      avatar_url,
      interests,
      consent_directory_visible,
      consent_directory_show_contacts
    `)
    .eq("id", user.id)
    .maybeSingle();

  // Convert DB nulls → undefined / sensible defaults for the form
  const initial = profile
    ? {
        ...profile,
        gender: profile.gender ?? undefined,
        phone_e164: profile.phone_e164 ?? "",
        city: profile.city ?? "",
        country: profile.country ?? "",
        graduation_year: profile.graduation_year ?? undefined,
        degree: profile.degree ?? undefined,
        branch: profile.branch ?? undefined,
        roll_number: profile.roll_number ?? "",
        employment_type: profile.employment_type ?? undefined,
        company: profile.company ?? "",
        designation: profile.designation ?? "",
        avatar_url: profile.avatar_url ?? undefined,
        interests: Array.isArray(profile.interests) ? profile.interests : [],
        consent_directory_visible: profile.consent_directory_visible ?? false,
        consent_directory_show_contacts: profile.consent_directory_show_contacts ?? false,
      }
    : undefined;

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <ProfileForm
        userEmail={profile?.email ?? user.email ?? undefined}
        userId={user.id}
        initial={initial}
      />
    </div>
  );
}
