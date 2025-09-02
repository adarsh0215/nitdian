"use client";

import * as React from "react";
import { createBrowserClient } from "@supabase/ssr";
import FiltersBar from "./FiltersBar";
import DirectoryProfileCard from "./DirectoryProfileCard";

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

const PER_PAGE = 12;

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DirectoryClient({
  initial,
}: {
  initial: {
    items: DirectoryItem[];
    total: number;
    perPage: number;
    filters: DirectoryFilters;
  };
}) {
  const [items, setItems] = React.useState<DirectoryItem[]>(initial.items);
  const [total, setTotal] = React.useState(initial.total);
  const [filters, setFilters] = React.useState<DirectoryFilters>(initial.filters);
  const [busy, setBusy] = React.useState(false);

  // --- URL sync --------------------------------------------------------------
  const updateUrl = React.useCallback((next: DirectoryFilters) => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    params.set("page", String(next.page));
    params.set("sort", next.sort);
    next.q ? params.set("q", next.q) : params.delete("q");
    next.branch ? params.set("branch", next.branch) : params.delete("branch");
    next.degree ? params.set("degree", next.degree) : params.delete("degree");
    next.year ? params.set("year", String(next.year)) : params.delete("year");
    window.history.replaceState({}, "", `${url.pathname}?${params.toString()}`);
  }, []);

  React.useEffect(() => {
    updateUrl(filters);
  }, [filters, updateUrl]);

  // --- Query ---------------------------------------------------------------
  const fetchPage = React.useCallback(
    async (page: number) => {
      setBusy(true);
      try {
        const from = (page - 1) * PER_PAGE;
        const to = from + PER_PAGE - 1;

        let q = supabase
          .from("profiles")
          .select(
            "id, full_name, avatar_url, degree, branch, graduation_year, designation, company, city, country",
            { count: "exact" }
          )
          .eq("is_public", true)
          .eq("is_approved", true);

        if (filters.q) {
          const term = `%${filters.q}%`;
          q = q.or(
            `full_name.ilike.${term},company.ilike.${term},city.ilike.${term},branch.ilike.${term}`
          );
        }
        if (filters.branch) q = q.eq("branch", filters.branch);
        if (filters.degree) q = q.eq("degree", filters.degree);
        if (filters.year) q = q.eq("graduation_year", filters.year);

        if (filters.sort === "name") q = q.order("full_name", { ascending: true });
        if (filters.sort === "recent") q = q.order("created_at", { ascending: false });
        if (filters.sort === "year_desc") q = q.order("graduation_year", { ascending: false });

        const { data, count, error } = await q.range(from, to);
        if (error) throw new Error(error.message ?? "Query failed");

        setItems((data ?? []) as DirectoryItem[]);
        setTotal(count ?? 0);
      } finally {
        setBusy(false);
      }
    },
    [filters]
  );

  React.useEffect(() => {
    void fetchPage(filters.page); // call, not expression
  }, [fetchPage, filters.page]);

  // --- handlers -------------------------------------------------------------
  const onChangeFilters = (patch: Partial<DirectoryFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
  };

  const onClearOne = (key: keyof DirectoryFilters) => {
    const cleared: Partial<DirectoryFilters> =
      key === "sort" || key === "page" ? {} : { [key]: undefined };
    setFilters((f) => ({ ...f, ...cleared, page: 1 }));
  };

  const onClearAll = () =>
    setFilters({ q: "", branch: undefined, degree: undefined, year: undefined, sort: "name", page: 1 });

  // --- render ---------------------------------------------------------------
  return (
    <div className="space-y-4">
      <FiltersBar initial={filters} onChange={onChangeFilters} busy={busy} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {items.map((p) => (
          <DirectoryProfileCard key={p.id} profile={p} layout="grid" />
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-muted-foreground">
          Showing {(filters.page - 1) * PER_PAGE + 1}–
          {Math.min(filters.page * PER_PAGE, total)} of {total}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            disabled={filters.page <= 1 || busy}
            onClick={() => onChangeFilters({ page: Math.max(1, filters.page - 1) })}
          >
            Previous
          </button>
          <button
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            disabled={filters.page * PER_PAGE >= total || busy}
            onClick={() => onChangeFilters({ page: filters.page + 1 })}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
