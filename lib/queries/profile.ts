// lib/queries/profiles.ts
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Fetches the current authenticated user's profile.
 * Returns null if not authenticated or on error.
 */
export async function getCurrentProfile() {
  const supabase = await supabaseServer();

  // 1. Get current auth user
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return null;

  // 2. Fetch the user's profile row
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      avatar_url,
      company,
      designation,
      degree,
      branch,
      graduation_year,
      city,
      country,
      is_public,
      onboarded,
      is_approved
    `
    )
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Profile fetch error:", error.message);
    return null;
  }

  return profile;
}
