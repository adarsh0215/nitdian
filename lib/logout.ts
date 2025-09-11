// lib/logout.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Reliable logout:
 * 1) Send sign_out log to /api/log-event using keepalive/sendBeacon
 * 2) Then call supabase.auth.signOut()
 *
 * Uses localStorage fallback for user id/email (saved by AuthWatcher).
 */
export async function logoutWithLogging() {
  // read last-known user info saved by AuthWatcher
  const lastUserId = (() => {
    try { return localStorage.getItem("last_user_id"); } catch { return null; }
  })();
  const lastUserEmail = (() => {
    try { return localStorage.getItem("last_user_email"); } catch { return null; }
  })();

  const payload = {
    user_id: lastUserId ?? null,
    user_email: lastUserEmail ?? null,
    action: "sign_out",
  };

  const bodyStr = JSON.stringify(payload);

  // Try navigator.sendBeacon first
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([bodyStr], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/log-event", blob);
      if (ok) {
        // queued — proceed to sign out
        await supabase.auth.signOut();
        return;
      }
    }
  } catch (err) {
    // continue to fallback
    console.warn("sendBeacon failed, falling back to fetch keepalive", err);
  }

  // Fallback to fetch with keepalive (modern browsers)
  try {
    // use keepalive to allow request to continue during unload
    await fetch("/api/log-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyStr,
      keepalive: true,
    });
  } catch (err) {
    // last-resort: POST may fail because page unloads — log to console
    console.warn("keepalive fetch failed or unsupported, proceeding to signOut", err);
  }

  // Finally sign out
  await supabase.auth.signOut();
}
