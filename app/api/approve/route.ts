// app/api/approve/route.ts
/**
 * POST /api/approve
 *
 * Body:
 *   { id: string, action: "APPROVE" | "REJECT" }
 *
 * Logic:
 *  - Authenticate caller server-side via supabaseServer()
 *  - Load caller's active member_memberships (start_date <= now AND (end_date IS NULL OR end_date >= now))
 *  - Load privileges for those membership types
 *  - Authorization:
 *      * If have APPROVE_ONBOARD_ALL.execute => allowed
 *      * Else if have APPROVE_ONBOARD_BATCH.execute => check membership.params:
 *          - params may be JSON like { "batches": [2017,2018] } or { "from": 2015, "to": 2019 }
 *          - if params include target's graduation_year => allowed
 *          - fallback: if caller profile graduation_year === target graduation_year => allowed
 *  - If allowed: update profile (status/is_approved/approved_by_email/approved_date) and insert audit record
 *  - Return { message: "Profile approved successfully" } (or rejected)
 */

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import supabaseAdmin from "@/lib/supabase/admin";

type Action = "APPROVE" | "REJECT";

type MemberMembership = {
  membership_type: string;
  start_date: string;
  end_date?: string | null;
  params?: unknown;
};

type PrivilegeRow = {
  membership_type: string;
  privilege: string;
  execute: boolean;
};

type ProfileRow = {
  id: string;
  graduation_year?: number | string | null;
  status?: string | null;
  email?: string | null;
};

/** Safely parse JSON; returns null if parse fails or value is falsy */
function safeParseJSON<T = unknown>(value: unknown): T | null {
  if (value === null || value === undefined || value === "") return null;
  try {
    if (typeof value === "string") {
      return JSON.parse(value) as T;
    }
    return value as T;
  } catch {
    return null;
  }
}

/** Narrow utility: is object (non-null) */
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Check params for batch membership acceptance */
function paramsAllowsYear(params: unknown, year: number): boolean {
  if (!isObject(params)) return false;

  // batches array
  const maybeBatches = params["batches"];
  if (Array.isArray(maybeBatches)) {
    return maybeBatches.some((y) => {
      const n = Number(y);
      return !Number.isNaN(n) && n === Number(year);
    });
  }

  // from / to range
  const maybeFrom = params["from"];
  const maybeTo = params["to"];
  const from = maybeFrom !== undefined && maybeFrom !== null ? Number(maybeFrom) : null;
  const to = maybeTo !== undefined && maybeTo !== null ? Number(maybeTo) : null;
  if (!Number.isNaN(from ?? NaN) && !Number.isNaN(to ?? NaN) && from !== null && to !== null) {
    return Number(year) >= from && Number(year) <= to;
  }

  return false;
}

export async function POST(req: Request) {
  try {
    // parse body
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const profileId = (body["id"] ?? body["profileId"]) as string | undefined;
    const action = (body["action"] as Action | undefined) ?? undefined;

    if (!profileId || (action !== "APPROVE" && action !== "REJECT")) {
      return NextResponse.json(
        { error: "Missing or invalid 'id' (profile id) or 'action' (APPROVE|REJECT)" },
        { status: 400 }
      );
    }

    // authenticate caller server-side via cookie-aware supabase
    const supabase = await supabaseServer();
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const approverEmail = userData.user.email;
    const nowISO = new Date().toISOString();

    // 1) Load approver active memberships (server admin client for DB reads)
    const { data: membershipsRaw, error: memErr } = await supabaseAdmin
      .from("member_memberships")
      .select("membership_type, start_date, end_date, params")
      .eq("user_email", approverEmail)
      .lte("start_date", nowISO)
      .limit(500);

    if (memErr) {
      console.error("member_memberships read error:", memErr);
      return NextResponse.json({ error: "Failed to read memberships" }, { status: 500 });
    }

    const memberships = (membershipsRaw ?? []) as MemberMembership[];

    const activeMemberships = memberships.filter((m) => {
      if (!m?.end_date) return true;
      try {
        return new Date(String(m.end_date)).toISOString() >= nowISO;
      } catch {
        return false;
      }
    });

    if (activeMemberships.length === 0) {
      return NextResponse.json({ error: "No active memberships found" }, { status: 403 });
    }

    const membershipTypes = Array.from(
      new Set(activeMemberships.map((m) => String(m.membership_type ?? "").trim()))
    ).filter(Boolean) as string[];

    if (!membershipTypes.length) {
      return NextResponse.json({ error: "No membership types found for approver" }, { status: 403 });
    }

    // 2) Load privileges for those membership types
    const { data: privilegesRaw, error: privErr } = await supabaseAdmin
      .from("membership_privilege")
      .select("membership_type, privilege, execute")
      .in("membership_type", membershipTypes)
      .limit(500);

    if (privErr) {
      console.error("membership_privilege read error:", privErr);
      return NextResponse.json({ error: "Failed to read privileges" }, { status: 500 });
    }

    const privileges = (privilegesRaw ?? []) as PrivilegeRow[];

    const hasApproveAll = privileges.some((p) => p.privilege === "APPROVE_ONBOARD_ALL" && Boolean(p.execute));
    const hasApproveBatch = privileges.some((p) => p.privilege === "APPROVE_ONBOARD_BATCH" && Boolean(p.execute));

    if (!hasApproveAll && !hasApproveBatch) {
      return NextResponse.json({ error: "No approval privileges found", status: "forbidden" }, { status: 403 });
    }

    // 3) Load target profile
    const { data: profileRaw, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("id, graduation_year, status")
      .eq("id", profileId)
      .maybeSingle();

    if (profErr) {
      console.error("profiles read error:", profErr);
      return NextResponse.json({ error: "Failed to read profile" }, { status: 500 });
    }
    const profile = profileRaw as ProfileRow | null;
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if (profile.status !== "PENDING") {
      return NextResponse.json({ error: "Profile not pending" }, { status: 400 });
    }

    // normalize target graduation year to number if possible
    const targetGradYear = profile.graduation_year !== undefined && profile.graduation_year !== null
      ? Number(profile.graduation_year)
      : null;

    // 4) Authorization decision
    let allowed = false;
    let membershipTypeUsed: string | null = null; // for audit

    if (hasApproveAll) {
      // if multiple membership types grant global approve, pick the first such membership type for audit
      const hit = privileges.find((p) => p.privilege === "APPROVE_ONBOARD_ALL" && Boolean(p.execute));
      membershipTypeUsed = hit?.membership_type ?? null;
      allowed = true;
    } else if (hasApproveBatch) {
      // Check each active membership of the approver that maps to a membership_type that has batch privilege
      for (const m of activeMemberships) {
        const mtype = String(m.membership_type ?? "");
        // only consider membership types that actually have the batch privilege
        const hasBatchForType = privileges.some(
          (p) => p.membership_type === mtype && p.privilege === "APPROVE_ONBOARD_BATCH" && Boolean(p.execute)
        );
        if (!hasBatchForType) continue;

        // parse params and check ranges/arrays
        const params = safeParseJSON<Record<string, unknown>>(m.params);
        if (targetGradYear !== null && paramsAllowsYear(params, targetGradYear)) {
          allowed = true;
          membershipTypeUsed = mtype;
          break;
        }
      }

      // fallback: legacy behavior — compare approver profile graduation_year to target's
      if (!allowed) {
        const { data: approverProfileRaw, error: apErr } = await supabaseAdmin
          .from("profiles")
          .select("graduation_year")
          .eq("email", approverEmail)
          .maybeSingle();

        if (apErr) {
          console.error("approver profile read error:", apErr);
          return NextResponse.json({ error: "Failed to read approver profile" }, { status: 500 });
        }

        const approverProfile = approverProfileRaw as { graduation_year?: number | string | null } | null;
        const approverYear = approverProfile?.graduation_year !== undefined && approverProfile?.graduation_year !== null
          ? Number(approverProfile.graduation_year)
          : null;

        if (approverYear !== null && targetGradYear !== null && approverYear === targetGradYear) {
          allowed = true;
        }
      }
    }

    if (!allowed) {
      // Do not leak sensitive info. Return a simple error.
      return NextResponse.json({ error: "Not authorized to approve/reject this profile" }, { status: 403 });
    }

    // 5) Update profile
    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
    const is_approved = action === "APPROVE";
    const updates: Partial<
      ProfileRow & { is_approved: boolean; approved_by_email: string; approved_date: string | null }
    > = {
      status: newStatus,
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

    // 6) Insert approval audit (best-effort; do not fail response if audit fails)
    try {
      await supabaseAdmin.from("approvals_audit").insert({
        profile_id: profileId,
        approver_email: approverEmail,
        membership_type: membershipTypeUsed,
        action,
      });
    } catch (auditErr) {
      // swallow audit errors but log for debugging
      console.warn("approvals_audit insert failed:", auditErr);
    }

    const successMessage = action === "APPROVE" ? "Profile approved successfully" : "Profile rejected successfully";
    return NextResponse.json({ message: successMessage });
  } catch (err: unknown) {
    console.error("ERROR /api/approve:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message ?? "Unknown server error" }, { status: 500 });
  }
}
