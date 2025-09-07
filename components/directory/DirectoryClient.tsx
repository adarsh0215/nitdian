"use client";

import * as React from "react";
import { createBrowserClient } from "@supabase/ssr";
import FiltersBar from "./FiltersBar";
import DirectoryProfileCard from "./DirectoryProfileCard";

// -------------------------
// Types
// -------------------------
// DirectoryFilters: state of search/sort/pagination
// DirectoryItem: individual profile entry in directory
// DirectoryInitial: initial payload provided by server
export type DirectoryFilters = {
  q?: string;
  branch?: string;
  degree?: string;
  year?: number;
  sort: "name" | "recent" | "year_desc";
  page: number;
};

export type DirectoryItem = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  degree: string | null;
  branch: string | null;
  graduation_year: number | null;
  designation: string | null;
  company: string | null;
  city: string | null;
  country: string | null;
};

export type DirectoryInitial = {
  items: DirectoryItem[];
  total: number;
  perPage: number;
  filters: DirectoryFilters;
};

// -------------------------
// Supabase client (browser)
// -------------------------
// Uses public anon key for client-side queries
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// -------------------------
// DirectoryClient Component
// -------------------------
// Client-side directory:
// - Maintains state of filters, items, pagination
// - Fetches from Supabase on filter/page changes
// - Renders FiltersBar + profile grid + pagination controls
export default function DirectoryClient({
  initial,
}: {
  initial: DirectoryInitial;
}) {
  // state seeded from server-provided initial data
  const [items, setItems] = React.useState<DirectoryItem[]>(initial.items);
  const [total, setTotal] = React.useState(initial.total);
  const [filters, setFilters] = React.useState<DirectoryFilters>(
    initial.filters
  );
  const [busy, setBusy] = React.useState(false);

  // use server-provided perPage (fallback 12 for safety)
  const perPage = initial.perPage || 12;

  // -------------------------
  // URL sync
  // -------------------------
  // Keeps URL query string in sync with filter state (back/forward friendly)
  const updateUrl = React.useCallback((next: DirectoryFilters) => {
    const url = new URL(window.location.href);
    const p = url.searchParams;
    p.set("page", String(next.page));
    p.set("sort", next.sort);
    next.q ? p.set("q", next.q) : p.delete("q");
    next.branch ? p.set("branch", next.branch) : p.delete("branch");
    next.degree ? p.set("degree", next.degree) : p.delete("degree");
    next.year ? p.set("year", String(next.year)) : p.delete("year");
    window.history.replaceState({}, "", `${url.pathname}?${p.toString()}`);
  }, []);

  React.useEffect(() => {
    updateUrl(filters);
  }, [filters, updateUrl]);

  // -------------------------
  // fetchPage
  // -------------------------
  // Core fetch routine: queries Supabase with filters + pagination
  // Updates items and total count
  const fetchPage = React.useCallback(
    async (page: number) => {
      setBusy(true);
      try {
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        // base query: only public + approved profiles
        let q = supabase
          .from("profiles")
          .select(
            "id, full_name, avatar_url, degree, branch, graduation_year, designation, company, city, country, created_at",
            { count: "exact" }
          )
          .eq("is_public", true)
          .eq("is_approved", true);

        // apply search term filter
        if (filters.q) {
          const term = `%${filters.q}%`;
          q = q.or(
            `full_name.ilike.${term},company.ilike.${term},city.ilike.${term},branch.ilike.${term}`
          );
        }

        // apply branch/degree/year filters
        if (filters.branch) q = q.eq("branch", filters.branch);
        if (filters.degree) q = q.eq("degree", filters.degree);
        if (filters.year) q = q.eq("graduation_year", filters.year);

        // apply sort
        if (filters.sort === "name")
          q = q.order("full_name", { ascending: true });
        if (filters.sort === "recent")
          q = q.order("created_at", { ascending: false });
        if (filters.sort === "year_desc")
          q = q.order("graduation_year", { ascending: false });

        // run query with pagination range
        const { data, count, error } = await q.range(from, to);
        if (error) throw new Error(error.message ?? "Query failed");

        setItems((data ?? []) as DirectoryItem[]);
        setTotal(count ?? 0);
      } finally {
        setBusy(false);
      }
    },
    [filters, perPage]
  );

  // -------------------------
  // Effect: refetch when page changes
  // -------------------------
  React.useEffect(() => {
    fetchPage(filters.page).catch(() => {});
  }, [fetchPage, filters.page]);

  // -------------------------
  // Update filters handler
  // -------------------------
  const onChangeFilters = (patch: Partial<DirectoryFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="space-y-4 m-8">
      {/* Top filter bar */}
      <FiltersBar initial={filters} onChange={onChangeFilters} busy={busy} />

      {/* Pagination controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-muted-foreground">
          Showing {(filters.page - 1) * perPage + 1}–
          {Math.min(filters.page * perPage, total)} of {total}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            disabled={filters.page <= 1 || busy}
            onClick={() =>
              onChangeFilters({ page: Math.max(1, filters.page - 1) })
            }
          >
            Previous
          </button>
          <button
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            disabled={filters.page * perPage >= total || busy}
            onClick={() => onChangeFilters({ page: filters.page + 1 })}
          >
            Next
          </button>
        </div>
      </div>

      {/* Profile grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {items.map((p) => (
          <DirectoryProfileCard key={p.id} profile={p} layout="grid" />
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-muted-foreground">
          Showing {(filters.page - 1) * perPage + 1}–
          {Math.min(filters.page * perPage, total)} of {total}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            disabled={filters.page <= 1 || busy}
            onClick={() =>
              onChangeFilters({ page: Math.max(1, filters.page - 1) })
            }
          >
            Previous
          </button>
          <button
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            disabled={filters.page * perPage >= total || busy}
            onClick={() => onChangeFilters({ page: filters.page + 1 })}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
