"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/redirects";

export async function signInWithPassword(prevState: any, formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "");

  const supabase = await supabaseServer(); // 👈 await

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message } as const;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No user in session." } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded,is_approved")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.onboarded) redirect("/onboarding");
  redirect(safeRedirect(next));
}

export async function signUpWithPassword(prevState: any, formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = await supabaseServer(); // 👈 await

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message } as const;

  redirect("/onboarding");
}

export async function signInWithGoogle(prevState: any, formData: FormData) {
  const next = String(formData.get("next") || "");
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const supabase = await supabaseServer(); // 👈 await

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error) return { ok: false, error: error.message } as const;
  return { ok: true, url: data.url } as const;
}

export async function signOut() {
  const supabase = await supabaseServer(); // 👈 await
  await supabase.auth.signOut();
  redirect("/login");
}
