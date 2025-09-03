// actions/auth.ts
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/redirects";

type ActionResult = { ok: true; url: string } | { ok: false; error: string };

/** Prefer /dashboard unless `next` is a safe, meaningful in-app path. */
function preferDashboard(p?: string | null) {
  const s = safeRedirect(p ?? undefined);
  return s && s !== "/" ? s : "/dashboard";
}

/** Robustly detect Next.js redirect errors thrown by `redirect()` */
function isNextRedirectError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === "string") return err.includes("NEXT_REDIRECT");
  const anyErr = err as Record<string, unknown>;
  const digest = typeof anyErr?.digest === "string" ? (anyErr.digest as string) : "";
  const message = typeof anyErr?.message === "string" ? (anyErr.message as string) : "";
  return digest.includes("NEXT_REDIRECT") || message.includes("NEXT_REDIRECT");
}

export async function signInWithPassword(
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const nextRaw = String(formData.get("next") || "");

    const supabase = await supabaseServer();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No user in session." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded,is_approved")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !profile.onboarded) {
      redirect("/onboarding"); // throws -> must not be swallowed
    }

    redirect(preferDashboard(nextRaw)); // throws
  } catch (e: unknown) {
    if (isNextRedirectError(e)) throw e; // let Next complete the navigation
    return { ok: false, error: e instanceof Error ? e.message : "Unexpected error" };
  }
}

export async function signUpWithPassword(
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    const supabase = await supabaseServer();

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { ok: false, error: error.message };

    redirect("/onboarding"); // throws
  } catch (e: unknown) {
    if (isNextRedirectError(e)) throw e; // do not swallow redirect
    return { ok: false, error: e instanceof Error ? e.message : "Unexpected error" };
  }
}

export async function signInWithGoogle(
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Build origin that works locally / on Vercel
    const h = await headers(); // not async
    const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
    const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    const origin = `${proto}://${host}`;

    const nextRaw = formData.get("next")?.toString() || "";
    const next = preferDashboard(nextRaw);

    const supabase = await supabaseServer();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) return { ok: false, error: error.message || "OAuth init failed" };
    if (!data?.url) return { ok: false, error: "No redirect URL returned" };

    return { ok: true, url: data.url };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Unexpected error" };
  }
}

export async function signOut(): Promise<void> {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/login"); // throws (no try/catch needed)
}
