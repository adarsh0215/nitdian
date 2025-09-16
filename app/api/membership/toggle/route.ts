// app/api/membership/toggle/route.ts
/**
 * POST /api/membership/toggle
 * Server-side route to toggle current user's membership between ADMIN_L1 <-> ADMIN_L2.
 *
 * Behavior:
 *  - Authenticate the user using supabaseServer() (reads cookies properly).
 *  - Query member_memberships rows for that user with membership_type IN ('ADMIN_L1','ADMIN_L2').
 *  - If one or more rows exist, update them to the other membership_type (L1->L2 or L2->L1).
 *  - If none exist, insert a new membership row with membership_type = 'ADMIN_L2' (promotion default)
 *    and start_date = now(), end_date = now + 1 year.
 *
 * Response JSON:
 *  { ok: true, newType: 'ADMIN_L2' }  on success
 *  { error: '...' }                    on failure
 *
 * This keeps logic simple and predictable for quick toggling for testing/admin usage.
 */

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import supabaseAdmin from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    // Authenticate (server-side) using your helper that awaits cookies()
    const sb = await supabaseServer();
    const { data: userData, error: userErr } = await sb.auth.getUser();
    if (userErr || !userData?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const email = userData.user.email;

    // Find existing membership rows for this email that are ADMIN_L1 or ADMIN_L2
    const { data: rows, error: selErr } = await supabaseAdmin
      .from("member_memberships")
      .select("id, membership_type")
      .in("membership_type", ["ADMIN_L1", "ADMIN_L2"])
      .eq("user_email", email);

    if (selErr) {
      return NextResponse.json({ error: selErr.message }, { status: 500 });
    }

    // Determine new membership type
    let newType = "ADMIN_L2"; // default when inserting or toggling from nothing
    if (rows && rows.length > 0) {
      // If at least one row exists, pick the current type from the first row and toggle it.
      // (If there are multiple rows with different types, we toggle all to the resulting type.)
      const current = rows[0].membership_type;
      newType = current === "ADMIN_L2" ? "ADMIN_L1" : "ADMIN_L2";

      // Update all matching rows for this user (keeps DB consistent)
      const { error: updErr } = await supabaseAdmin
        .from("member_memberships")
        .update({ membership_type: newType })
        .in("membership_type", ["ADMIN_L1", "ADMIN_L2"])
        .eq("user_email", email);

      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, newType });
    }

    // If no membership rows found for ADMIN_L1/L2, insert a new row (promote to ADMIN_L2 by default)
    const now = new Date();
    const oneYear = new Date(now.getTime());
    oneYear.setFullYear(oneYear.getFullYear() + 1);

    const { error: insErr } = await supabaseAdmin
      .from("member_memberships")
      .insert([
        {
          user_email: email,
          membership_type: newType, // ADMIN_L2
          start_date: now.toISOString(),
          end_date: oneYear.toISOString(),
          created_at: now.toISOString(),
        },
      ]);

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, newType });
  } catch (err: any) {
    console.error("ERROR /api/membership/toggle:", err);
    return NextResponse.json({ error: err?.message ?? "Unknown server error" }, { status: 500 });
  }
}
