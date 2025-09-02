import { supabaseServer } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      avatar_url,
      headline,
      company,
      designation,
      degree,
      branch,
      graduation_year,
      city,
      country
    `
    )
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Profile fetch error", error);
    return null;
  }

  return profile;
}
