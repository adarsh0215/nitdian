"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { OnboardingSchema } from "@/lib/validation/onboarding";

type Result = { ok: false; error: string } | null;

export async function saveOnboarding(_prev: Result, formData: FormData): Promise<Result> {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return { ok: false, error: "Not authenticated." };

  const raw = Object.fromEntries(formData.entries());
  const picks = {
    full_name: String(raw.full_name || ""),
    email: String(raw.email || ""),
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
      formData.get("consent_terms_privacy") === "on" || String(raw.consent_terms_privacy) === "true",
    consent_directory_visible:
      formData.get("consent_directory_visible") === "on" || String(raw.consent_directory_visible) === "true",
    consent_directory_show_contacts:
      formData.get("consent_directory_show_contacts") === "on" ||
      String(raw.consent_directory_show_contacts) === "true",
  };

  const parsed = OnboardingSchema.safeParse(picks);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { ok: false, error: msg };
  }
  const v = parsed.data;

  const upsert = {
    id: user.id,
    email: v.email,
    full_name: v.full_name,
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
    onboarded: true,
    consent_terms_privacy: v.consent_terms_privacy,
    consent_directory_visible: v.consent_directory_visible,
    consent_directory_show_contacts: v.consent_directory_show_contacts,
  } as const;

  const { error: upsertErr } = await supabase
    .from("profiles")
    .upsert(upsert, { onConflict: "id" });

  if (upsertErr) return { ok: false, error: upsertErr.message };

  if (v.consent_terms_privacy) {
    await supabase
      .from("profiles")
      .update({ accepted_terms_at: new Date().toISOString() })
      .is("accepted_terms_at", null)
      .eq("id", user.id);
  }

  redirect("/dashboard");
}
