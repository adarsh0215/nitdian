// lib/privileges.ts
/**
 * The one place that answers: "which pending profiles may this approver act on?"
 *
 * Rules (from member_memberships + membership_privilege):
 *  - APPROVE_ONBOARD_ALL with execute  -> every pending profile
 *  - APPROVE_ONBOARD_BATCH with execute -> graduation years listed in the
 *    membership's params ({"batches":[2017,2018]} or {"from":2015,"to":2019});
 *    if no params yield years, fall back to the approver's own graduation year
 *  - otherwise -> nothing
 */

import supabaseAdmin from "@/lib/supabase/admin";

export type ApprovalScope =
  | { kind: "all" }
  | { kind: "batch"; years: number[] }
  | { kind: "none" };

/** Years permitted by a membership's params JSON; [] if none/unparseable. */
function yearsFromParams(params: string | null): number[] {
  if (!params) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(params);
  } catch {
    return [];
  }
  if (typeof parsed !== "object" || parsed === null) return [];
  const p = parsed as Record<string, unknown>;

  if (Array.isArray(p.batches)) {
    return p.batches.map(Number).filter((n) => Number.isInteger(n));
  }
  const from = Number(p.from);
  const to = Number(p.to);
  if (Number.isInteger(from) && Number.isInteger(to) && from <= to) {
    const years: number[] = [];
    for (let y = from; y <= to; y++) years.push(y);
    return years;
  }
  return [];
}

/** Compute the approval scope for an approver identified by email. Throws on DB errors. */
export async function getApprovalScope(approverEmail: string): Promise<ApprovalScope> {
  const nowISO = new Date().toISOString();

  const { data: memberships, error: memErr } = await supabaseAdmin
    .from("member_memberships")
    .select("membership_type, end_date, params")
    .eq("user_email", approverEmail)
    .lte("start_date", nowISO);
  if (memErr) throw memErr;

  const active = (memberships ?? []).filter(
    (m) => !m.end_date || new Date(m.end_date).getTime() >= Date.now(),
  );
  const types = [...new Set(active.map((m) => m.membership_type.trim()))].filter(Boolean);
  if (types.length === 0) return { kind: "none" };

  const { data: privileges, error: privErr } = await supabaseAdmin
    .from("membership_privilege")
    .select("membership_type, privilege, execute")
    .in("membership_type", types);
  if (privErr) throw privErr;

  const privs = privileges ?? [];
  const canExecute = (type: string, privilege: string) =>
    privs.some((p) => p.membership_type === type && p.privilege === privilege && p.execute);

  if (privs.some((p) => p.privilege === "APPROVE_ONBOARD_ALL" && p.execute)) {
    return { kind: "all" };
  }
  if (!privs.some((p) => p.privilege === "APPROVE_ONBOARD_BATCH" && p.execute)) {
    return { kind: "none" };
  }

  const years = new Set<number>();
  for (const m of active) {
    if (!canExecute(m.membership_type.trim(), "APPROVE_ONBOARD_BATCH")) continue;
    for (const y of yearsFromParams(m.params)) years.add(y);
  }

  // Legacy fallback: batch privilege with no params -> approver's own batch.
  if (years.size === 0) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("graduation_year")
      .eq("email", approverEmail)
      .maybeSingle();
    if (profile?.graduation_year != null) years.add(profile.graduation_year);
  }

  return years.size > 0 ? { kind: "batch", years: [...years] } : { kind: "none" };
}

/** May this scope approve/reject a profile from the given graduation year? */
export function scopeAllowsYear(scope: ApprovalScope, year: number | null): boolean {
  if (scope.kind === "all") return true;
  if (scope.kind === "batch") return year !== null && scope.years.includes(year);
  return false;
}
