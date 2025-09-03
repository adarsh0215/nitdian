// lib/supabase/session.ts
import { supabaseServer } from "@/lib/supabase/server";

export type SessionProfile = {
  userId: string;
  email: string | null;
  onboarded: boolean;
  isApproved: boolean;
  isAdmin: boolean;
};

/**
 * Fetches the authenticated user and their profile/admin flags.
 * Returns null if no session.
 */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await supabaseServer();

  // 1) Auth user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return null;

  // 2) Profile + admin row (fetch in parallel)
  const [{ data: profile }, { data: adminRow }] = await Promise.all([
    supabase
      .from("profiles")
      .select("email,onboarded,is_approved")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("admins").select("id").eq("id", user.id).maybeSingle(),
  ]);

  return {
    userId: user.id,
    email: profile?.email ?? user.email ?? null,
    onboarded: Boolean(profile?.onboarded),
    isApproved: Boolean(profile?.is_approved),
    isAdmin: Boolean(adminRow),
  };
}

/* ------------------------------------------------------------------ */
/*                     Minimal seed for the UserPill                   */
/* ------------------------------------------------------------------ */
export type PillSeed = {
  /** Display name (profile.full_name or email prefix or "Member") */
  name: string;
  /** Email to show under the name */
  email: string;
  /** Avatar URL if present */
  avatarUrl: string | null;
};

/**
 * Returns minimal fields to render the UserPill immediately.
 * Does not change any existing behavior. Returns null if not signed in.
 */
export async function getPillSeed(): Promise<PillSeed | null> {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,avatar_url,email")
    .eq("id", user.id)
    .maybeSingle();

  const email = profile?.email ?? user.email ?? "";
  const name =
    (profile?.full_name && profile.full_name.trim()) ||
    (email ? email.split("@")[0] : "") ||
    "Member";
  const avatarUrl = profile?.avatar_url ?? null;

  return { name, email, avatarUrl };
}
