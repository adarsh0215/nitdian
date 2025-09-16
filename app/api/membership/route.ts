// app/api/membership/route.ts
/**
 * GET /api/membership?email=someone@example.com
 *
 * 1) Get member_memberships for the user that are active now
 * 2) Use membership_type values to fetch membership_privilege rows
 * 3) Return privileges joined with params (params come from member_memberships)
 */

import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase/admin";

type MemberMembershipRow = {
  membership_type: string;
  params?: unknown;
  start_date?: string | null;
  end_date?: string | null;
};

type PrivilegeRow = {
  membership_type: string;
  privilege: string;
  view?: boolean | null;
  edit?: boolean | null;
  execute?: boolean | null;
};

/** Narrowing helper */
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userEmail = url.searchParams.get("email");
    if (!userEmail) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }

    const nowISO = new Date().toISOString();

    // --- Step 1: fetch active memberships for this user ---
    const { data: membershipsRaw, error: memErr } = await supabaseAdmin
      .from("member_memberships")
      .select("membership_type, params, start_date, end_date")
      .eq("user_email", userEmail)
      .lte("start_date", nowISO)
      .limit(500);

    if (memErr) {
      return NextResponse.json(
        { error: "member_memberships error", detail: memErr.message },
        { status: 500 }
      );
    }

    const memberships = (membershipsRaw ?? []) as MemberMembershipRow[];

    // Keep only active (end_date is null OR end_date >= now)
    const activeMemberships = memberships.filter((m) => {
      if (!m) return false;
      if (!m.end_date) return true;
      try {
        return new Date(String(m.end_date)).toISOString() >= nowISO;
      } catch {
        return false;
      }
    });

    if (activeMemberships.length === 0) {
      return NextResponse.json({ privileges: [], note: "no active memberships" });
    }

    // --- Step 2: fetch privileges for these membership_types ---
    const membershipTypes = Array.from(
      new Set(activeMemberships.map((m) => String(m.membership_type ?? "").trim()))
    ).filter(Boolean);

    if (membershipTypes.length === 0) {
      return NextResponse.json({ privileges: [], note: "no membership types found" });
    }

    const { data: privilegesRaw, error: privErr } = await supabaseAdmin
      .from("membership_privilege")
      .select("membership_type, privilege, view, edit, execute")
      .in("membership_type", membershipTypes)
      .limit(500);

    if (privErr) {
      return NextResponse.json(
        { error: "membership_privilege error", detail: privErr.message },
        { status: 500 }
      );
    }

    const privileges = (privilegesRaw ?? []) as PrivilegeRow[];

    // Build response: attach params from the corresponding membership row
    const paramsByType = new Map<string, unknown | null>();
    activeMemberships.forEach((m) => {
      const key = String(m.membership_type ?? "").trim();
      paramsByType.set(key, m.params ?? null);
    });

    const result = privileges.map((p) => {
      const membership_type = String(p.membership_type ?? "");
      return {
        membership_type,
        privilege: String(p.privilege ?? ""),
        view: p.view ?? false,
        edit: p.edit ?? false,
        execute: p.execute ?? false,
        params: paramsByType.get(membership_type) ?? null,
      };
    });

    return NextResponse.json({ privileges: result });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "unexpected error", detail }, { status: 500 });
  }
}
