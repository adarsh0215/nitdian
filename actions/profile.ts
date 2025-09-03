// actions/profile.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { OnboardingSchema } from "@/lib/validation/onboarding";

// Profile = Onboarding minus terms checkbox
const ProfileSchema = OnboardingSchema.omit({ consent_terms_privacy: true });

function fdToObject(fd: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) {
    if (k === "interests") {
      if (!Array.isArray(obj.interests)) obj.interests = [];
      (obj.interests as unknown[]).push(v);
    } else {
      obj[k] = v;
    }
  }
  return obj;
}

export async function saveProfile(formData: FormData) {
  const supabase = await supabaseServer();

  // Must be signed in
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false as const, error: "Not authenticated." };
  }

  // Parse + coerce
  const raw = fdToObject(formData);

  if (raw.interests) {
    raw.interests = (Array.isArray(raw.interests) ? raw.interests : [raw.interests])
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n));
  }
  if (raw.graduation_year === "" || raw.graduation_year == null) {
    raw.graduation_year = undefined;
  } else {
    raw.graduation_year = Number(raw.graduation_year);
  }

  let parsed: z.infer<typeof ProfileSchema>;
  try {
    parsed = ProfileSchema.parse(raw);
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues?.[0]?.message ?? "Invalid input." : "Invalid input.";
    return { ok: false as const, error: msg };
  }

  // Persist
  const { error: upErr } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.full_name,
      email: parsed.email,
      phone_e164: parsed.phone_e164 ?? null,
      city: parsed.city ?? null,
      country: parsed.country ?? null,
      graduation_year: parsed.graduation_year ?? null,
      degree: parsed.degree ?? null,
      branch: parsed.branch ?? null,
      roll_number: parsed.roll_number ?? null,
      employment_type: parsed.employment_type ?? null,
      company: parsed.company ?? null,
      designation: parsed.designation ?? null,
      interests: parsed.interests ?? [],
      consent_directory_visible: parsed.consent_directory_visible ?? false,
      consent_directory_show_contacts: parsed.consent_directory_show_contacts ?? false,
    })
    .eq("id", user.id);

  if (upErr) {
    return { ok: false as const, error: "Could not save profile. Please try again." };
  }

  // Revalidate pages that depend on profile
  revalidatePath("/profile");
  revalidatePath("/directory");

  return { ok: true as const };
}
