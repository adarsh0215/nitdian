// actions/auth.ts
"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type ActionResult = { ok: true; url: string } | { ok: false; error: string };

/** Detect Next.js redirect() thrown value so we rethrow it properly. */
function isNextRedirectError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === "string") return err.includes("NEXT_REDIRECT");
  const anyErr = err as Record<string, unknown>;
  const digest = typeof anyErr?.digest === "string" ? (anyErr.digest as string) : "";
  const message = typeof anyErr?.message === "string" ? (anyErr.message as string) : "";
  return digest.includes("NEXT_REDIRECT") || message.includes("NEXT_REDIRECT");
}

/**
 * EMAIL + PASSWORD SIGN-UP
 * Runs on the server; if the project requires email confirm, there may be no session yet.
 */
export async function signUpWithPassword(
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) return { ok: false, error: "Email and password are required." };

    const supabase = await supabaseServer();

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { ok: false, error: error.message };

    // If email confirmation is required, there won't be a session yet
    if (!data.session) redirect("/auth/verify-email");

    // Otherwise, proceed to onboarding
    redirect("/onboarding");
  } catch (e) {
    if (isNextRedirectError(e)) throw e;
    return { ok: false, error: e instanceof Error ? e.message : "Unexpected error" };
  }
}
