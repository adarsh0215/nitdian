// actions/profile.ts
"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { OnboardingSchema } from "@/lib/validation/onboarding";

type Result = { ok: false; error: string } | null;

/* ------------------------- shared helpers ------------------------- */

function parseFromForm(formData: FormData):
  | { values: ReturnType<typeof OnboardingSchema.parse> }
  | { error: string } {
  const raw = Object.fromEntries(formData.entries());

  const picks = {
    full_name: String(raw.full_name || ""),
    email: String(raw.email || ""),
    // NEW 👇 gender (optional)
    gender: raw.gender ? String(raw.gender) : undefined,

    phone_e164: String(raw.phone_e164 || ""),
    city: String(raw.city || ""),
    country: String(raw.country || ""),
    graduation_year: String(raw.graduation_year || ""),
    degree: raw.degree ? String(raw.degree) : undefined,
    branch: raw.branch ? String(raw.branch) : undefined,
    roll_number: String(raw.roll_number || ""),
    employment_type: raw.employment_type ? String(raw.employment_type) : undefined,
    company: String(raw.company || ""),
    designation: String(raw.designation || ""),
    avatar_url: String(raw.avatar_url || ""),
    interests:
      formData.getAll("interests")?.map(String) ??
      (raw.interests ? String(raw.interests).split(",").map((s) => s.trim()) : []),
    consent_terms_privacy:
      formData.get("consent_terms_privacy") === "on" ||
      String(raw.consent_terms_privacy) === "true",
    consent_directory_visible:
      formData.get("consent_directory_visible") === "on" ||
      String(raw.consent_directory_visible) === "true",
    consent_directory_show_contacts:
      formData.get("consent_directory_show_contacts") === "on" ||
      String(raw.consent_directory_show_contacts) === "true",
  };

  const parsed = OnboardingSchema.safeParse(picks);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: msg };
  }
  return { values: parsed.data };
}

async function upsertProfileBase(opts: {
  values: ReturnType<typeof OnboardingSchema.parse>;
  setOnboarded?: boolean;
}): Promise<Result> {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return { ok: false, error: "Not authenticated." };

  const v = opts.values;

  // Keep the payload shape simple & permissive for TS
  const upsert: Record<string, any> = {
    id: user.id,
    email: v.email,
    full_name: v.full_name,
    // NEW 👇 persist gender
    gender: v.gender ?? null,

    phone_e164: v.phone_e164 || null,
    city: v.city || null,
    country: v.country || null,
    graduation_year: v.graduation_year ?? null,
    degree: v.degree ?? null,
    branch: v.branch ?? null,
    roll_number: v.roll_number || null,
    employment_type: v.employment_type ?? null,
    company: v.company || null,
    designation: v.designation || null,
    avatar_url: v.avatar_url || null,
    interests: v.interests && v.interests.length ? v.interests : [],
    consent_terms_privacy: v.consent_terms_privacy,
    consent_directory_visible: v.consent_directory_visible,
    consent_directory_show_contacts: v.consent_directory_show_contacts,
  };

  if (opts.setOnboarded) upsert.onboarded = true;

  const { error: upsertErr } = await supabase
    .from("profiles")
    .upsert(upsert, { onConflict: "id" });

  if (upsertErr) return { ok: false, error: upsertErr.message };

  // Simpler: just set the timestamp (avoid `.is(..., null)` typing hassles)
  if (v.consent_terms_privacy) {
    await supabase
      .from("profiles")
      .update({ accepted_terms_at: new Date().toISOString() })
      .eq("id", user.id);
  }

  return null;
}

/* ------------------------- actions ------------------------- */

// Keep your onboarding behavior (redirect after save)
export async function saveOnboarding(_prev: Result, formData: FormData): Promise<Result> {
  const parsed = parseFromForm(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const result = await upsertProfileBase({ values: parsed.values, setOnboarded: true });
  if (result) return result;

  redirect("/dashboard");
}

// New action for Profile page (no redirect)
// actions/profile.ts (only the saveProfile export shown)

export async function saveProfile(_prev: Result, formData: FormData): Promise<Result> {
  const parsed = parseFromForm(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const result = await upsertProfileBase({ values: parsed.values, setOnboarded: false });
  if (result) return result; // show validation/db error on the form

  // ✅ redirect after successful update
  redirect("/dashboard");
}
