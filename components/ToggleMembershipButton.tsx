// components/ToggleMembershipButton.tsx
"use client";

import React, { useEffect, useState } from "react";

/**
 * ToggleMembershipButton
 *
 * - Shows a button that swaps the caller's membership between ADMIN_L1 <-> ADMIN_L2.
 * - Fetches the current membership (if any) by calling the server route (we reuse toggle route for status)
 *   NOTE: For simplicity we call the toggle route only when user clicks; but we also optionally
 *   call GET /api/member_membership_status if you want to show current state without toggling.
 *
 * Usage:
 *  <ToggleMembershipButton />
 *
 * Later you can swap window.alert to Sonner/toast by replacing the alert(...) lines.
 */

export default function ToggleMembershipButton() {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<string | null>(null); // shows "ADMIN_L1" / "ADMIN_L2" or null

  // Optional: fetch current membership display on mount (non-destructive):
  // For simplicity we attempt to infer current membership by calling a "status" API
  // If you don't have such API, skip this effect. Here we try a minimal approach:
  useEffect(() => {
    // try to fetch current membership rows (non-destructive) using supabaseAdmin-backed route
    // If you haven't created GET /api/membership/status, this will be silently ignored.
    (async () => {
      try {
        const res = await fetch("/api/membership/status");
        if (!res.ok) return;
        const json = await res.json();
        if (json?.membershipType) setCurrent(json.membershipType);
      } catch {
        // ignore
      }
    })();
  }, []);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/membership/toggle", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        const err = json?.error ?? `Server returned ${res.status}`;
        alert("Toggle failed: " + err);
        console.error("Toggle membership failed:", json);
        return;
      }

      // success -> show basic confirmation and update UI
      const newType = json?.newType ?? null;
      setCurrent(newType);
      alert("Membership updated to: " + newType);
    } catch (e) {
      console.error("Network error toggling membership", e);
      alert("Network error toggling membership");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-block">
      <div className="mb-2 text-sm text-muted-foreground">
        Current role:{" "}
        <strong className="ml-1">{current ?? "Unknown (click toggle)"}</strong>
      </div>
      <button
        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        onClick={handleToggle}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Working..." : "Toggle ADMIN_L1 <-> ADMIN_L2"}
      </button>
    </div>
  );
}
