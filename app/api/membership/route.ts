// app/api/membership/route.ts
/**
 * GET /api/membership?email=someone@example.com
 *
 * Implements your pseudocode:
 * 1) Get member_memberships for the user that are active now
 * 2) Use membership_type values to fetch membership_privilege rows
 * 3) Return privileges joined with params (params come from member_memberships)
 *
 * Notes:
 * - Uses supabaseAdmin (server-side service role client) to run DB queries simply.
 * - Avoids fragile implicit joins; does two simple queries (membership rows -> privileges).
 */

import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userEmail = url.searchParams.get("email");
    if (!userEmail) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }

    const nowISO = new Date().toISOString();

    // --- Step 1: fetch active memberships for this user ---
    const { data: memberships, error: memErr } = await supabaseAdmin
      .from("member_memberships")
      .select("membership_type, params, start_date, end_date")
      .eq("user_email", userEmail)
      .lte("start_date", nowISO)   // start_date <= now
      .limit(500);                 // defensive limit

    if (memErr) {
      // helpful error message for debugging
      return NextResponse.json({ error: "member_memberships error", detail: memErr.message }, { status: 500 });
    }

    // Keep only active (end_date is null OR end_date >= now)
    const activeMemberships = (memberships || []).filter((m: any) => {
      if (!m.end_date) return true;
      try {
        return new Date(m.end_date).toISOString() >= nowISO;
      } catch {
        return false;
      }
    });

    if (activeMemberships.length === 0) {
      return NextResponse.json({ privileges: [], note: "no active memberships" });
    }

    // --- Step 2: fetch privileges for these membership_types ---
    const membershipTypes = Array.from(new Set(activeMemberships.map((m: any) => m.membership_type))).filter(Boolean);

    if (membershipTypes.length === 0) {
      return NextResponse.json({ privileges: [], note: "no membership types found" });
    }

    const { data: privileges, error: privErr } = await supabaseAdmin
      .from("membership_privilege")
      .select("membership_type, privilege, view, edit, execute")
      .in("membership_type", membershipTypes)
      .limit(500);

    if (privErr) {
      return NextResponse.json({ error: "membership_privilege error", detail: privErr.message }, { status: 500 });
    }

    // Build response: attach params from the corresponding membership row
    const paramsByType = new Map<string, any>();
    activeMemberships.forEach((m: any) => paramsByType.set(m.membership_type, m.params ?? null));

    const result = (privileges || []).map((p: any) => ({
      membership_type: p.membership_type,
      privilege: p.privilege,
      view: p.view,
      edit: p.edit,
      execute: p.execute,
      params: paramsByType.get(p.membership_type) ?? null,
    }));

    return NextResponse.json({ privileges: result });
  } catch (err: any) {
    return NextResponse.json({ error: "unexpected error", detail: err?.message ?? String(err) }, { status: 500 });
  }
}
