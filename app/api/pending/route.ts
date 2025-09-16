// app/api/pending/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import supabaseAdmin from "@/lib/supabase/admin";

/** Local row types */
type MemberMembershipRow = {
  membership_type: string;
  start_date: string | null;
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
  full_name?: string | null;
  graduation_year?: number | string | null;
  branch?: string | null;
  company?: string | null;
  designation?: string | null;
  avatar_url?: string | null;
  status?: string | null;
  is_approved?: boolean | null;
};

/** Supabase storage helper result types (v2 shape) */
type GetPublicUrlResult = { data: { publicUrl: string } | null; error: unknown };
type CreateSignedUrlResult = { data: { signedUrl: string | null } | null; error: unknown };

/** Safely parse JSON; returns null on failure */
function safeParseJSON<T = unknown>(value: unknown): T | null {
  if (value === null || value === undefined || value === "") return null;
  try {
    if (typeof value === "string") return JSON.parse(value) as T;
    return value as T;
  } catch {
    return null;
  }
}

/** Narrowing helper */
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * Convert an avatar path or value into a usable public URL.
 *
 * - If the value is already an http(s) URL, return it as-is.
 * - Otherwise assume it's a storage path and attempt to:
 *    1) getPublicUrl (works for public buckets)
 *    2) if that doesn't produce a usable URL, call createSignedUrl(path, 60)
 *
 * Returns null if a URL could not be produced.
 */
async function resolveAvatarPublicUrl(avatarValue?: string | null) {
  if (!avatarValue) return null;
  if (/^https?:\/\//i.test(avatarValue)) return avatarValue;

  const bucketName = "avatars";

  try {
    // getPublicUrl (sync)
    const publicRes = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(avatarValue) as GetPublicUrlResult;

    const publicUrlCandidate = publicRes?.data?.publicUrl ?? null;
    if (typeof publicUrlCandidate === "string" && /^https?:\/\//i.test(publicUrlCandidate)) {
      return publicUrlCandidate;
    }

    // createSignedUrl (async)
    const signedRes = (await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(avatarValue, 60)) as CreateSignedUrlResult;

    const signedUrlCandidate = signedRes?.data?.signedUrl ?? null;
    if (typeof signedUrlCandidate === "string" && /^https?:\/\//i.test(signedUrlCandidate)) {
      return signedUrlCandidate;
    }

    return null;
  } catch (err) {
    console.error("resolveAvatarPublicUrl error:", err);
    return null;
  }
}

/** Check whether membership.params allows the given graduation year (kept for completeness) */
function paramsAllowsYear(params: unknown, year: number): boolean {
  const parsed = safeParseJSON<Record<string, unknown>>(params);
  if (!parsed) return false;

  if (Array.isArray(parsed.batches)) {
    return parsed.batches.some((y) => {
      const n = Number(y);
      return !Number.isNaN(n) && n === Number(year);
    });
  }

  const from = parsed.from !== undefined && parsed.from !== null ? Number(parsed.from) : null;
  const to = parsed.to !== undefined && parsed.to !== null ? Number(parsed.to) : null;
  if (from !== null && to !== null && !Number.isNaN(from) && !Number.isNaN(to)) {
    return Number(year) >= from && Number(year) <= to;
  }
  return false;
}

/**
 * GET /api/pending
 * Returns { pending: [...] } (pending profiles user is allowed to act upon)
 */
export async function GET() {
  try {
    // 1) Authenticate caller server-side
    const supabase = await supabaseServer();
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const approverEmail = userData.user.email;
    const nowISO = new Date().toISOString();

    // 2) Load approver active memberships
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

    const memberships = (membershipsRaw ?? []) as MemberMembershipRow[];

    const activeMemberships = memberships.filter((m) => {
      if (!m?.end_date) return true;
      try {
        return new Date(String(m.end_date)).toISOString() >= nowISO;
      } catch {
        return false;
      }
    });

    if (activeMemberships.length === 0) {
      return NextResponse.json({ pending: [] });
    }

    const membershipTypes = Array.from(
      new Set(activeMemberships.map((m) => String(m.membership_type ?? "").trim()))
    ).filter(Boolean) as string[];

    if (!membershipTypes.length) {
      return NextResponse.json({ pending: [] });
    }

    // 3) Load privileges for the membership types
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

    // If has global approve -> return all pending profiles (with resolved avatars)
    if (hasApproveAll) {
      const { data: pendingRaw, error: pErr } = await supabaseAdmin
        .from("profiles")
        .select(
          "id, full_name, graduation_year, branch, company, designation, avatar_url, status, is_approved"
        )
        .eq("status", "PENDING")
        .eq("is_approved", false)
        .limit(1000);

      if (pErr) {
        console.error("profiles read error:", pErr);
        return NextResponse.json({ error: "Failed to load pending profiles" }, { status: 500 });
      }

      const pending = (pendingRaw ?? []) as ProfileRow[];

      const enriched = await Promise.all(
        pending.map(async (pr) => {
          const avatar_public_url = await resolveAvatarPublicUrl(pr.avatar_url ?? null);
          return {
            id: pr.id,
            full_name: pr.full_name ?? null,
            graduation_year: pr.graduation_year ?? null,
            branch: pr.branch ?? null,
            company: pr.company ?? null,
            designation: pr.designation ?? null,
            avatar_url: pr.avatar_url ?? null,
            avatar_public_url,
            status: pr.status ?? null,
            is_approved: pr.is_approved ?? null,
          };
        })
      );

      return NextResponse.json({ pending: enriched ?? [] });
    }

    // If does not have batch privilege either -> user can't approve anything
    if (!hasApproveBatch) {
      return NextResponse.json({ pending: [] });
    }

    // 4) hasApproveBatch true (but not approve all) -> compute allowed batches
    const allowedYears = new Set<number>();

    for (const m of activeMemberships) {
      const mType = String(m.membership_type ?? "");
      const typeHasBatch = privileges.some(
        (p) => p.membership_type === mType && p.privilege === "APPROVE_ONBOARD_BATCH" && Boolean(p.execute)
      );
      if (!typeHasBatch) continue;

      const params = safeParseJSON<Record<string, unknown>>(m.params);
      if (!params) continue;

      if (Array.isArray(params.batches)) {
        for (const y of params.batches) {
          const ny = Number(y);
          if (!Number.isNaN(ny)) allowedYears.add(ny);
        }
      } else if (params.from !== undefined && params.to !== undefined) {
        const from = Number(params.from);
        const to = Number(params.to);
        if (!Number.isNaN(from) && !Number.isNaN(to) && from <= to) {
          for (let y = from; y <= to; y++) allowedYears.add(y);
        }
      }
    }

    // 5) fallback: if allowedYears is empty, use approver's profile graduation_year
    if (allowedYears.size === 0) {
      const { data: approverProfileRaw, error: apErr } = await supabaseAdmin
        .from("profiles")
        .select("graduation_year")
        .eq("email", approverEmail)
        .maybeSingle();

      if (
        !apErr &&
        approverProfileRaw &&
        approverProfileRaw.graduation_year !== undefined &&
        approverProfileRaw.graduation_year !== null
      ) {
        const ay = Number(approverProfileRaw.graduation_year);
        if (!Number.isNaN(ay)) allowedYears.add(ay);
      }
    }

    if (allowedYears.size === 0) {
      return NextResponse.json({ pending: [] });
    }

    // 6) Fetch pending profiles that match allowedYears
    const yearsArray = Array.from(allowedYears.values()).map((y) => Number(y));

    const { data: pendingFilteredRaw, error: pfErr } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, full_name, graduation_year, branch, company, designation, avatar_url, status, is_approved"
      )
      .in("graduation_year", yearsArray)
      .eq("status", "PENDING")
      .eq("is_approved", false)
      .limit(1000);

    if (pfErr) {
      console.error("profiles filtered read error:", pfErr);
      return NextResponse.json({ error: "Failed to load filtered pending profiles" }, { status: 500 });
    }

    const pendingFiltered = (pendingFilteredRaw ?? []) as ProfileRow[];

    const enrichedFiltered = await Promise.all(
      pendingFiltered.map(async (pr) => {
        const avatar_public_url = await resolveAvatarPublicUrl(pr.avatar_url ?? null);
        return {
          id: pr.id,
          full_name: pr.full_name ?? null,
          graduation_year: pr.graduation_year ?? null,
          branch: pr.branch ?? null,
          company: pr.company ?? null,
          designation: pr.designation ?? null,
          avatar_url: pr.avatar_url ?? null,
          avatar_public_url,
          status: pr.status ?? null,
          is_approved: pr.is_approved ?? null,
        };
      })
    );

    return NextResponse.json({ pending: enrichedFiltered ?? [] });
  } catch (err: unknown) {
    console.error("ERROR /api/pending:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
