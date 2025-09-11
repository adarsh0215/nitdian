// app/memoirs/page.tsx
/**
 * Server page for /memoirs
 *
 * Fixes:
 * - Removed selection of `avatar_url` (column not present in memoirs table)
 * - Defensive logging (safe string) so console.error doesn't cause overlay noise
 * - Fail-soft: on query error we return an empty items list (client shows "No memoirs")
 *
 * Keeps: pagination (PER_PAGE), ordering by priority_seq then date_approved,
 * and returns `initial` shape expected by the client component.
 */

import MemoirsList from "@/components/memoirs/MemoirsList";
import { supabaseServer } from "@/lib/supabase/server";

const PER_PAGE = 24; // adjust if you want a different page size

function asString(v: string | string[] | undefined) {
  return typeof v === "string" ? v : undefined;
}
function asNumber(v: string | string[] | undefined) {
  const s = asString(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function parseFilters(sp: Record<string, string | string[] | undefined>) {
  const page = Math.max(1, asNumber(sp.page) ?? 1);
  return { page };
}

export default async function MemoirsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { page } = parseFilters(sp);

  const supabase = await supabaseServer();

  // NOTE: only select columns that exist in your `memoirs` table.
  // From your schema: id, created_at, email, message, show_on_main_page,
  // priority_seq, name, batch, branch, role_company, date_approved, active
  // (avatar_url is not present so we do NOT request it).
  let q = supabase
    .from("memoirs")
    .select(
      "id, name, message, role_company, batch, branch, email, show_on_main_page, priority_seq, date_approved, created_at",
      { count: "exact" }
    )
    .eq("active", true)
    .not("date_approved", "is", null);

  // Order: priority_seq ascending (lower = higher priority), then newest approved first
  q = q.order("priority_seq", { ascending: true }).order("date_approved", { ascending: false });

  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  // Run query
  const { data, count, error } = await q.range(from, to);

  // Defensive logging: always stringify safely so dev overlay doesn't choke on complex objects
  if (error) {
    try {
      const safe =
        typeof error === "string" ? error : (error as any)?.message ?? JSON.stringify(error);
      console.error("app/memoirs/page.tsx - supabase error:", safe);
    } catch {
      console.error("app/memoirs/page.tsx - supabase error (unserializable):", String(error));
    }
    // Fail-soft: continue with empty rows so UI doesn't break
  }

  const rows = Array.isArray(data) ? data : [];

  // Map DB rows to frontend shape. avatar is null because memoirs table has none.
  const items = rows.map((r: any) => ({
    id: r.id,
    quote: r.message ?? "",
    author: r.name ?? r.email ?? "Anonymous",
    role: r.role_company ?? r.branch ?? undefined,
    year: r.batch ?? undefined,
    avatar: null, // no avatar field in memoirs table
    priority: r.priority_seq ?? null,
    approved_at: r.date_approved ?? null,
  }));

  const initial = {
    items,
    total: (typeof count === "number" && Number.isFinite(count)) ? count : 0,
    perPage: PER_PAGE,
    filters: { page },
  };

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MemoirsList initial={initial} />
      </div>
    </section>
  );
}
