// actions/profile.ts
"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
// ⬇️ import BOTH schemas
import { OnboardingSchema, ProfileSchema } from "@/lib/validation/onboarding";

type Result = { ok: true } | { ok: false; error: string } | null;

/* ---------- FormData helpers (null-safe) ---------- */
function sReq(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v : "";
}
function sOpt(v: FormDataEntryValue | null): string | undefined {
  return typeof v === "string" ? v : undefined;
}
function bOpt(v: FormDataEntryValue | null): boolean | undefined {
  const t = typeof v === "string" ? v.trim().toLowerCase() : "";
  return t === "true" ? true : t === "false" ? false : undefined;
}
function nOpt(v: FormDataEntryValue | null): number | undefined {
  if (typeof v !== "string" || v.trim() === "") return undefined;
  const num = Number(v);
  return Number.isFinite(num) ? num : undefined;
}

/* ---------- Shared parse from FormData ---------- */
function parseRawFromFormData(fd: FormData) {
  return {
    // identity
    full_name: sReq(fd.get("full_name")),
    email: sReq(fd.get("email")),
    gender: sOpt(fd.get("gender")),

    // contact
    phone_e164: sReq(fd.get("phone_e164")),
    city: sOpt(fd.get("city")),
    country: sOpt(fd.get("country")),

    // education
    graduation_year: nOpt(fd.get("graduation_year")),
    degree: sOpt(fd.get("degree")),
    branch: sOpt(fd.get("branch")),
    roll_number: sOpt(fd.get("roll_number")),

    // work
    employment_type: sOpt(fd.get("employment_type")),
    company: sOpt(fd.get("company")),
    designation: sOpt(fd.get("designation")),

    // media
    avatar_url: sOpt(fd.get("avatar_url")),

    // interests (multi)
    interests: fd.getAll("interests").map(String),

    // consents
    consent_terms_privacy: bOpt(fd.get("consent_terms_privacy")),
    consent_directory_visible: bOpt(fd.get("consent_directory_visible")),
    consent_directory_show_contacts: bOpt(fd.get("consent_directory_show_contacts")),
  };
}

/* ---------- Onboarding (strict) ---------- */
export async function saveOnboarding(
  _prevState: Result,
  fd: FormData
): Promise<Result> {
  const sb = await supabaseServer();
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser();
  if (userErr || !user) return { ok: false, error: "Not authenticated" };

  const raw = parseRawFromFormData(fd);
  const parsed = OnboardingSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    return { ok: false, error: msg || "Invalid input" };
  }
  const v = parsed.data;

  const accepted_terms_at = v.consent_terms_privacy ? new Date().toISOString() : null;
  const is_public = v.consent_directory_visible ?? undefined;

  const { error } = await sb
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: v.email!,
        full_name: v.full_name!,
        gender: v.gender ?? null,

        phone_e164: v.phone_e164 ?? null,
        city: v.city ?? null,
        country: v.country ?? null,

        graduation_year: v.graduation_year ?? null,
        degree: v.degree ?? null,
        branch: v.branch ?? null,
        roll_number: v.roll_number ?? null,

        employment_type: v.employment_type ?? null,
        company: v.company ?? null,
        designation: v.designation ?? null,

        avatar_url: v.avatar_url ?? null,

        interests: v.interests ?? [],

        onboarded: true,
        consent_terms_privacy: v.consent_terms_privacy ?? false,
        consent_directory_visible: v.consent_directory_visible ?? false,
        consent_directory_show_contacts: v.consent_directory_show_contacts ?? false,
        accepted_terms_at,

        ...(is_public !== undefined ? { is_public } : {}),
      },
      { onConflict: "id" }
    )
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message || "Failed to save onboarding" };
  }

  redirect("/dashboard");
}

/* ---------- Profile (no redirect) ---------- */
export async function saveProfile(
  _prevState: Result,
  fd: FormData
): Promise<Result> {
  const sb = await supabaseServer();
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser();
  if (userErr || !user) return { ok: false, error: "Not authenticated" };

  const raw = parseRawFromFormData(fd);

  // Use the dedicated ProfileSchema (terms optional; same directory constraint)
  const parsed = ProfileSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    return { ok: false, error: msg || "Invalid input" };
  }
  const v = parsed.data;

  const is_public = v.consent_directory_visible ?? undefined;

  const { error } = await sb
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: v.email!,
        full_name: v.full_name!,
        gender: v.gender ?? null,

        phone_e164: v.phone_e164 ?? null,
        city: v.city ?? null,
        country: v.country ?? null,

        graduation_year: v.graduation_year ?? null,
        degree: v.degree ?? null,
        branch: v.branch ?? null,
        roll_number: v.roll_number ?? null,

        employment_type: v.employment_type ?? null,
        company: v.company ?? null,
        designation: v.designation ?? null,

        avatar_url: v.avatar_url ?? null,

        interests: v.interests ?? [],

        // keep consents editable
        consent_terms_privacy: v.consent_terms_privacy ?? false,
        consent_directory_visible: v.consent_directory_visible ?? false,
        consent_directory_show_contacts: v.consent_directory_show_contacts ?? false,

        // do NOT touch onboarded / accepted_terms_at on profile edits
        ...(is_public !== undefined ? { is_public } : {}),
      },
      { onConflict: "id" }
    )
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message || "Failed to save profile" };
  }

  return { ok: true };
}
