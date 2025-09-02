// app/directory/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import DirectoryClient, {
  type DirectoryItem,
  type DirectoryInitial,
} from "@/components/directory/DirectoryClient";

const PER_PAGE = 24;

function parseFilters(searchParams: Record<string, string | string[] | undefined>) {
  const s = (k: string) =>
    typeof searchParams[k] === "string" ? String(searchParams[k]) : undefined;
  const n = (k: string) => {
    const v = s(k);
    return v ? Number(v) : undefined;
  };

  return {
    q: s("q"),
    branch: s("branch"),
    degree: s("degree"),
    year: n("year"),
    city: s("city"),
    sort: (s("sort") as "name" | "recent" | "year_desc") ?? "name",
    view: (s("view") as "grid" | "list") ?? "grid",
    page: Math.max(1, n("page") ?? 1),
  };
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  let q = sb
    .from("profiles")
    .select(
      "id, full_name, avatar_url, branch, degree, graduation_year, company, designation, city, country, is_public, is_approved, created_at",
      { count: "exact" }
    )
    .eq("is_public", true)
    .eq("is_approved", true);

  const like = (v?: string) => (v ? `%${v}%` : undefined);

  if (filters.q) {
    const esc = filters.q.replace(/[%]/g, "");
    q = q.or(
      `full_name.ilike.%${esc}%,company.ilike.%${esc}%,designation.ilike.%${esc}%,city.ilike.%${esc}%`
    );
  }
  if (filters.branch) q = q.eq("branch", filters.branch);
  if (filters.degree) q = q.eq("degree", filters.degree);
  if (filters.year) q = q.eq("graduation_year", filters.year);
  if (filters.city) q = q.ilike("city", like(filters.city)!);

  switch (filters.sort) {
    case "recent":
      q = q.order("created_at", { ascending: false });
      break;
    case "year_desc":
      q = q
        .order("graduation_year", { ascending: false, nullsFirst: false })
        .order("full_name", { ascending: true });
      break;
    default:
      q = q.order("full_name", { ascending: true });
  }

  const from = (filters.page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const { data, count, error } = await q.range(from, to);
  if (error) {
    console.error("[Directory][SSR] query error:", error);
    throw new Error(error.message ?? "Failed to load directory");
  }

  const initial: DirectoryInitial = {
    items: (data ?? []) as unknown as DirectoryItem[],
    total: count ?? 0,
    page: filters.page,
    perPage: PER_PAGE,
    filters,
  };

  return (
    <main className="mx-auto max-w-6xl p-6">
      <DirectoryClient initial={initial} />
    </main>
  );
}
