// app/directory/page.tsx
import DirectoryClient, {
  type DirectoryItem,
  type DirectoryInitial,
  type DirectoryFilters,
} from "@/components/directory/DirectoryClient";
import { supabaseServer } from "@/lib/supabase/server";

const PER_PAGE = 24;

// helpers
function asString(v: string | string[] | undefined) {
  return typeof v === "string" ? v : undefined;
}
function asNumber(v: string | string[] | undefined) {
  const s = asString(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function parseFilters(
  sp: Record<string, string | string[] | undefined>
): DirectoryFilters {
  const page = Math.max(1, asNumber(sp.page) ?? 1);
  const sort = (asString(sp.sort) as DirectoryFilters["sort"]) ?? "name";
  return {
    q: asString(sp.q) ?? "",
    branch: asString(sp.branch),
    degree: asString(sp.degree),
    year: asNumber(sp.year),
    sort,
    page,
  };
}

export default async function DirectoryPage({
  searchParams,
}: {
  // Next.js 15: searchParams is a Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const supabase = await supabaseServer();

  // base query
  let q = supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, degree, branch, graduation_year, designation, company, city, country, created_at",
      { count: "exact" }
    )
    .eq("is_public", true)
    .eq("is_approved", true);

  // search / filters
  if (filters.q) {
    const term = `%${filters.q}%`;
    q = q.or(
      `full_name.ilike.${term},company.ilike.${term},city.ilike.${term},branch.ilike.${term}`
    );
  }
  if (filters.branch) q = q.eq("branch", filters.branch);
  if (filters.degree) q = q.eq("degree", filters.degree);
  if (filters.year) q = q.eq("graduation_year", filters.year);

  // sort
  if (filters.sort === "name") q = q.order("full_name", { ascending: true });
  if (filters.sort === "recent") q = q.order("created_at", { ascending: false });
  if (filters.sort === "year_desc")
    q = q.order("graduation_year", { ascending: false });

  // pagination
  const from = (filters.page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;
  const { data, count, error } = await q.range(from, to);
  if (error) {
    // Fail-soft: empty list if something goes wrong
    console.error("Directory initial fetch failed:", error.message);
  }

  const initial: DirectoryInitial = {
    items: (data ?? []) as DirectoryItem[],
    total: count ?? 0,
    perPage: PER_PAGE,
    filters, // <-- 'page' lives inside here
  };

  return <DirectoryClient initial={initial} />;
}
