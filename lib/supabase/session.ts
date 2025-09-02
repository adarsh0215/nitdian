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

  // 1. Auth user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return null;

  // 2. Profile + admin row (fetch in parallel)
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
