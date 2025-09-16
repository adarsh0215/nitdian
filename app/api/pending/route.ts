// app/api/pending/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import supabaseAdmin from "@/lib/supabase/admin";

/**
 * Helper: safe JSON parse
 */
function safeParseJSON<T = any>(value: any): T | null {
  if (!value) return null;
  try {
    return typeof value === "string" ? (JSON.parse(value) as T) : (value as T);
  } catch {
    return null;
  }
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
 *
 * Note: bucketName should be changed if your bucket is named differently.
 */
async function resolveAvatarPublicUrl(avatarValue?: string | null) {
  if (!avatarValue) return null;

  // 1) if already full URL -> return it
  if (/^https?:\/\//i.test(avatarValue)) return avatarValue;

  // 2) treat as storage path (bucket + path or path)
  // If your app uses a bucket other than "avatars", change this value.
  const bucketName = "avatars";

  try {
    // getPublicUrl returns { data: { publicUrl } } (supabase-js v2)
    const { data: publicData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(avatarValue);
    const publicUrl = (publicData as any)?.publicUrl ?? null;
    if (publicUrl && /^https?:\/\//i.test(publicUrl)) {
      return publicUrl;
    }

    // If the bucket is private or getPublicUrl didn't produce a usable URL,
    // try creating a short-lived signed URL (60 seconds).
    // createSignedUrl returns { data: { signedUrl } }.
    const { data: signedData, error: signedErr } = await supabaseAdmin
      .storage
      .from(bucketName)
      .createSignedUrl(avatarValue, 60);

    if (signedErr) {
      // signed url creation failed (maybe path doesn't exist); log and return null
      console.warn("createSignedUrl failed:", signedErr?.message ?? signedErr);
      return null;
    }

    const signedUrl = (signedData as any)?.signedUrl ?? null;
    if (signedUrl && /^https?:\/\//i.test(signedUrl)) {
      return signedUrl;
    }

    return null;
  } catch (err) {
    console.error("resolveAvatarPublicUrl error:", err);
    return null;
  }
}

/**
 * Check whether membership.params allows the given graduation year
 * (left here for completeness — the route uses a set-based approach below).
 */
function paramsAllowsYear(params: any, year: number): boolean {
  if (!params) return false;
  if (Array.isArray(params.batches)) {
    return params.batches.some((y: any) => Number(y) === Number(year));
  }
  const from = params.from !== undefined ? Number(params.from) : null;
  const to = params.to !== undefined ? Number(params.to) : null;
  if (from !== null && to !== null) {
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
    const { data: memberships, error: memErr } = await supabaseAdmin
      .from("member_memberships")
      .select("membership_type, start_date, end_date, params")
      .eq("user_email", approverEmail)
      .lte("start_date", nowISO)
      .limit(500);

    if (memErr) {
      console.error("member_memberships read error:", memErr);
      return NextResponse.json({ error: "Failed to read memberships" }, { status: 500 });
    }

    const activeMemberships = (memberships || []).filter((m: any) => {
      if (!m?.end_date) return true;
      try {
        return new Date(m.end_date).toISOString() >= nowISO;
      } catch {
        return false;
      }
    });

    if (activeMemberships.length === 0) {
      // No active memberships → no privileges
      return NextResponse.json({ pending: [] });
    }

    const membershipTypes = Array.from(new Set(activeMemberships.map((m: any) => m.membership_type))).filter(Boolean);

    if (!membershipTypes.length) {
      return NextResponse.json({ pending: [] });
    }

    // 3) Load privileges for the membership types
    const { data: privileges, error: privErr } = await supabaseAdmin
      .from("membership_privilege")
      .select("membership_type, privilege, execute")
      .in("membership_type", membershipTypes)
      .limit(500);

    if (privErr) {
      console.error("membership_privilege read error:", privErr);
      return NextResponse.json({ error: "Failed to read privileges" }, { status: 500 });
    }

    const hasApproveAll = (privileges || []).some(
      (p: any) => p.privilege === "APPROVE_ONBOARD_ALL" && p.execute
    );
    const hasApproveBatch = (privileges || []).some(
      (p: any) => p.privilege === "APPROVE_ONBOARD_BATCH" && p.execute
    );

    // If has global approve -> return all pending profiles (with resolved avatars)
    if (hasApproveAll) {
      const { data: pending, error: pErr } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, graduation_year, branch, company, designation, avatar_url, status, is_approved")
        .eq("status", "PENDING")
        .eq("is_approved", false)
        .limit(1000);

      if (pErr) {
        console.error("profiles read error:", pErr);
        return NextResponse.json({ error: "Failed to load pending profiles" }, { status: 500 });
      }

      // Resolve avatar urls in parallel (safe & best-effort)
      const enriched = await Promise.all(
        (pending || []).map(async (pr: any) => {
          const avatar_public_url = await resolveAvatarPublicUrl(pr.avatar_url ?? null);
          return {
            id: pr.id,
            full_name: pr.full_name,
            graduation_year: pr.graduation_year,
            branch: pr.branch ?? null,
            company: pr.company ?? null,
            designation: pr.designation ?? null,
            avatar_url: pr.avatar_url ?? null, // original stored value
            avatar_public_url,
            status: pr.status,
            is_approved: pr.is_approved,
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

    // consider only memberships that are active and map to types that have batch privilege
    for (const m of activeMemberships) {
      const mType = m.membership_type;
      const typeHasBatch = (privileges || []).some(
        (p: any) => p.membership_type === mType && p.privilege === "APPROVE_ONBOARD_BATCH" && p.execute
      );
      if (!typeHasBatch) continue;

      const params = safeParseJSON<any>(m.params);
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
      const { data: approverProfile, error: apErr } = await supabaseAdmin
        .from("profiles")
        .select("graduation_year")
        .eq("email", approverEmail)
        .maybeSingle();

      if (!apErr && approverProfile?.graduation_year) {
        allowedYears.add(Number(approverProfile.graduation_year));
      }
    }

    if (allowedYears.size === 0) {
      // nothing allowed
      return NextResponse.json({ pending: [] });
    }

    // 6) Fetch pending profiles that match allowedYears
    const yearsArray = Array.from(allowedYears.values()).map((y) => Number(y));

    const { data: pendingFiltered, error: pfErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, graduation_year, branch, company, designation, avatar_url, status, is_approved")
      .in("graduation_year", yearsArray)
      .eq("status", "PENDING")
      .eq("is_approved", false)
      .limit(1000);

    if (pfErr) {
      console.error("profiles filtered read error:", pfErr);
      return NextResponse.json({ error: "Failed to load filtered pending profiles" }, { status: 500 });
    }

    const enrichedFiltered = await Promise.all(
      (pendingFiltered || []).map(async (pr: any) => {
        const avatar_public_url = await resolveAvatarPublicUrl(pr.avatar_url ?? null);
        return {
          id: pr.id,
          full_name: pr.full_name,
          graduation_year: pr.graduation_year,
          branch: pr.branch ?? null,
          company: pr.company ?? null,
          designation: pr.designation ?? null,
          avatar_url: pr.avatar_url ?? null,
          avatar_public_url,
          status: pr.status,
          is_approved: pr.is_approved,
        };
      })
    );

    return NextResponse.json({ pending: enrichedFiltered ?? [] });
  } catch (err) {
    console.error("ERROR /api/pending:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
