// app/api/approve/route.ts
/**
 * POST /api/approve
 * Body: { id: string, action: "APPROVE" | "REJECT" }  (id also accepted as profileId)
 *
 * Authenticates the caller, computes their approval scope (lib/privileges.ts),
 * and if the target pending profile falls inside it, flips its status.
 */

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import supabaseAdmin from "@/lib/supabase/admin";
import { getApprovalScope, scopeAllowsYear } from "@/lib/privileges";
import type { Database } from "@/lib/supabase/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const profileId = (body?.["id"] ?? body?.["profileId"]) as string | undefined;
    const action = body?.["action"];

    if (!profileId || (action !== "APPROVE" && action !== "REJECT")) {
      return NextResponse.json(
        { error: "Missing or invalid 'id' (profile id) or 'action' (APPROVE|REJECT)" },
        { status: 400 }
      );
    }

    const supabase = await supabaseServer();
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const approverEmail = userData.user.email;

    const { data: profile, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("id, graduation_year, status")
      .eq("id", profileId)
      .maybeSingle();

    if (profErr) {
      console.error("profiles read error:", profErr);
      return NextResponse.json({ error: "Failed to read profile" }, { status: 500 });
    }
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if (profile.status !== "PENDING") {
      return NextResponse.json({ error: "Profile not pending" }, { status: 400 });
    }

    const scope = await getApprovalScope(approverEmail);
    if (!scopeAllowsYear(scope, profile.graduation_year)) {
      return NextResponse.json(
        { error: "Not authorized to approve/reject this profile" },
        { status: 403 }
      );
    }

    const nowISO = new Date().toISOString();
    const is_approved = action === "APPROVE";
    const updates: Database["public"]["Tables"]["profiles"]["Update"] = {
      status: is_approved ? "APPROVED" : "REJECTED",
      is_approved,
      approved_by_email: approverEmail,
      approved_date: is_approved ? nowISO : null,
    };

    const { error: updErr } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", profileId)
      .eq("status", "PENDING");

    if (updErr) {
      console.error("profiles update error:", updErr);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({
      message: is_approved ? "Profile approved successfully" : "Profile rejected successfully",
    });
  } catch (err: unknown) {
    console.error("ERROR /api/approve:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message || "Unknown server error" }, { status: 500 });
  }
}
