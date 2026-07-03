// actions/auth.ts
"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/redirects";

export type AuthActionState =
  | { ok: true; message: string }
  | { ok: false; error: string }
  | null;

function credentials(formData: FormData) {
  return {
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || ""),
    next: safeRedirect(String(formData.get("next") || "")),
  };
}

/** EMAIL + PASSWORD SIGN-IN. Cookies are written server-side; redirect re-renders everything. */
export async function signInWithPassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const { email, password, next } = credentials(formData);
  if (!email || !password) return { ok: false, error: "Email and password are required." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  redirect(next);
}

/** EMAIL + PASSWORD SIGN-UP. If the project requires email confirmation there is no session yet. */
export async function signUpWithPassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const { email, password } = credentials(formData);
  if (!email || !password) return { ok: false, error: "Email and password are required." };

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message };

  if (!data.session) {
    return { ok: true, message: "Check your email to confirm your account, then log in." };
  }
  redirect("/onboarding");
}
