// app/directory/page.tsx
import DirectoryClient, {
  type DirectoryItem,
  type DirectoryInitial,
  type DirectoryFilters,
} from "@/components/directory/DirectoryClient";
import { supabaseServer } from "@/lib/supabase/server";

const PER_PAGE = 24;

// -------------------------
// Helpers: safe coercion
// -------------------------
// - `asString`: ensures query param is a string
// - `asNumber`: ensures query param is a finite number
function asString(v: string | string[] | undefined) {
  return typeof v === "string" ? v : undefined;
}
function asNumber(v: string | string[] | undefined) {
  const s = asString(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

// -------------------------
// Parse query params -> DirectoryFilters
// -------------------------
// Normalizes and defaults filter state for directory searches.
// Ensures valid page number and fallback sort option.
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

// -------------------------
// DirectoryPage (Server Component)
// -------------------------
// Responsible for:
// - reading filters from searchParams
// - querying Supabase with those filters
// - applying sorting + pagination
// - returning initial data to the client component
export default async function DirectoryPage({
  searchParams,
}: {
  // Next.js 15: searchParams is passed as a Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const supabase = await supabaseServer();

  // -------------------------
  // Base query:
  // fetch only approved + public profiles
  // -------------------------
  let q = supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, degree, branch, graduation_year, designation, company, city, country, created_at",
      { count: "exact" }
    )
    .eq("is_public", true)
    .eq("is_approved", true);

  // -------------------------
  // Apply search term filter
  // -------------------------
  if (filters.q) {
    const term = `%${filters.q}%`;
    q = q.or(
      `full_name.ilike.${term},company.ilike.${term},city.ilike.${term},branch.ilike.${term}`
    );
  }

  // -------------------------
  // Apply branch / degree / year filters
  // -------------------------
  if (filters.branch) q = q.eq("branch", filters.branch);
  if (filters.degree) q = q.eq("degree", filters.degree);
  if (filters.year) q = q.eq("graduation_year", filters.year);

  // -------------------------
  // Sorting options
  // -------------------------
  if (filters.sort === "name") q = q.order("full_name", { ascending: true });
  if (filters.sort === "recent") q = q.order("created_at", { ascending: false });
  if (filters.sort === "year_desc")
    q = q.order("graduation_year", { ascending: false });

  // -------------------------
  // Pagination
  // -------------------------
  const from = (filters.page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;
  const { data, count, error } = await q.range(from, to);

  if (error) {
    // Fail-soft: return empty list to avoid breaking UI
    console.error("Directory initial fetch failed:", error.message);
  }

  // -------------------------
  // Build initial client payload
  // -------------------------
  const initial: DirectoryInitial = {
    items: (data ?? []) as DirectoryItem[],
    total: count ?? 0,
    perPage: PER_PAGE,
    filters, // includes current page and filter state
  };

  return <DirectoryClient initial={initial} />;
}
