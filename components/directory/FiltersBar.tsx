"use client";

import * as React from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { BRANCHES, DEGREES } from "@/lib/validation/onboarding";
import type { DirectoryFilters } from "./DirectoryClient";

const CLEAR = "__any__";

// -------------------------
// Utility: generate years descending from current -> start
// -------------------------
function yearsFrom(start = 1961) {
  const y = new Date().getFullYear();
  const arr: number[] = [];
  for (let i = y; i >= start; i--) arr.push(i);
  return arr;
}

// Simple Filter Icon (SVG)
function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// -------------------------
// FiltersBar Component
// -------------------------
// - Desktop: inline row of search + filters (unchanged logic).
// - Mobile: small search + filter button that opens slide-over with full controls.
// -------------------------
export default function FiltersBar({
  initial,
  onChange,
  busy,
}: {
  initial: DirectoryFilters;
  onChange: (patch: Partial<DirectoryFilters>) => void;
  busy: boolean;
}) {
  // Local state seeded from server initial filters
  
  const [local, setLocal] = React.useState<DirectoryFilters>({
    ...initial,
    sort: initial.sort ?? "recent",
  });

  // Drawer open state for mobile filters
  const [open, setOpen] = React.useState(false);

  // Debounce free-text search (unchanged)
  React.useEffect(() => {
    const t = setTimeout(() => onChange({ q: local.q, page: 1 }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.q]);

  // Shared UI for branch/degree/year/sort/clear — reused in desktop and drawer
  const FiltersContent = (
    <div className="space-y-4 p-4">
      {/* Branch */}
      <div>
        <label className="sr-only">Branch</label>
        <Select
          value={local.branch ?? ""}
          onValueChange={(v) => {
            const value = v === CLEAR ? undefined : v;
            setLocal((s) => ({ ...s, branch: value }));
            onChange({ branch: value, page: 1 });
          }}
        >
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={CLEAR}>All branches</SelectItem>
            {BRANCHES.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Degree */}
      <div>
        <label className="sr-only">Degree</label>
        <Select
          value={local.degree ?? ""}
          onValueChange={(v) => {
            const value = v === CLEAR ? undefined : v;
            setLocal((s) => ({ ...s, degree: value }));
            onChange({ degree: value, page: 1 });
          }}
        >
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Degree" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={CLEAR}>All degrees</SelectItem>
            {DEGREES.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year */}
      <div>
        <label className="sr-only">Year</label>
        <Select
          value={local.year ? String(local.year) : ""}
          onValueChange={(v) => {
            const value = v === CLEAR ? undefined : Number(v);
            setLocal((s) => ({ ...s, year: value }));
            onChange({ year: value, page: 1 });
          }}
        >
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={CLEAR}>Any</SelectItem>
            {yearsFrom().map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div>
        <label className="sr-only">Sort</label>
        <Select
          value={local.sort}
          onValueChange={(v: "name" | "recent" | "year_desc") => {
            setLocal((s) => ({ ...s, sort: v }));
            onChange({ sort: v, page: 1 });
          }}
        >
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently joined</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
            <SelectItem value="year_desc">Grad year (newest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear button */}
      <div>
        <Button
          size="sm"
          variant="outline"
          className="h-10 w-full"
          disabled={busy}
          onClick={() => {
            const cleared = {
              q: "",
              city: undefined,
              branch: undefined,
              degree: undefined,
              year: undefined,
              // Reset sort to your chosen default (recent)
              sort: "recent" as const,
            };
            setLocal((s) => ({ ...s, ...cleared }));
            onChange({ ...cleared, page: 1 });
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* --- Top Row: mobile shows compact search + filter button; desktop shows full inline controls --- */}
      <div className="flex items-center gap-2">
        {/* Mobile: compact search input */}
        <div className="flex-1 min-w-0 sm:hidden">
          <Input
            className="h-10 w-full"
            placeholder="Search by name, company, city"
            value={local.q ?? ""}
            onChange={(e) => setLocal((s) => ({ ...s, q: e.target.value }))}
          />
        </div>

        {/* Mobile: filter button (opens drawer) */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="filters-drawer"
          onClick={() => setOpen(true)}
          className="sm:hidden inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
        >
          <FilterIcon />
          <span>Filters</span>
        </button>

        {/* Desktop: full inline layout (keeps original desktop grid) */}
        <div className="hidden sm:block w-full">
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            {/* Search (smaller than before so branch can be wider) */}
            <div className="flex-[1] min-w-[280px]">
              <Input
                className="h-10 w-full"
                placeholder="Search by name, company, city"
                value={local.q ?? ""}
                onChange={(e) => setLocal((s) => ({ ...s, q: e.target.value }))}
              />
            </div>

            {/* Branch - make this larger to accommodate long branch names */}
            <div className="flex-[2] min-w-[220px]">
              <Select
                value={local.branch ?? ""}
                onValueChange={(v) => {
                  const value = v === CLEAR ? undefined : v;
                  setLocal((s) => ({ ...s, branch: value }));
                  onChange({ branch: value, page: 1 });
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value={CLEAR}>All branches</SelectItem>
                  {BRANCHES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Degree - make this smaller (compact) */}
            <div className="flex-none w-40">
              <Select
                value={local.degree ?? ""}
                onValueChange={(v) => {
                  const value = v === CLEAR ? undefined : v;
                  setLocal((s) => ({ ...s, degree: value }));
                  onChange({ degree: value, page: 1 });
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Degree" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value={CLEAR}>All degrees</SelectItem>
                  {DEGREES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="flex-none w-28">
              <Select
                value={local.year ? String(local.year) : ""}
                onValueChange={(v) => {
                  const value = v === CLEAR ? undefined : Number(v);
                  setLocal((s) => ({ ...s, year: value }));
                  onChange({ year: value, page: 1 });
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value={CLEAR}>Any</SelectItem>
                  {yearsFrom().map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="flex-none w-44">
              <Select
                value={local.sort}
                onValueChange={(v: "name" | "recent" | "year_desc") => {
                  setLocal((s) => ({ ...s, sort: v }));
                  onChange({ sort: v, page: 1 });
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A–Z</SelectItem>
                  <SelectItem value="recent">Recently joined</SelectItem>
                  <SelectItem value="year_desc">Grad year (newest)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear button */}
            <div className="flex-none">
              <Button
                size="sm"
                variant="outline"
                className="h-10"
                disabled={busy}
                onClick={() => {
                  const cleared = {
                    q: "",
                    city: undefined,
                    branch: undefined,
                    degree: undefined,
                    year: undefined,
                    // Reset sort to your chosen default (recent)
                    sort: "recent" as const,
                  };
                  setLocal((s) => ({ ...s, ...cleared }));
                  onChange({ ...cleared, page: 1 });
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------
          Mobile Drawer / Slide-over (right side)
          - Visible only when `open` is true.
          - Contains the full FiltersContent defined above.
          ------------------------- */}
      {open && (
        <div
          id="filters-drawer"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />

          {/* Drawer panel */}
          <aside className="ml-auto relative w-full max-w-sm bg-background border-l p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="rounded p-1 hover:bg-muted"
              >
                {/* simple X icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Search inside drawer (full-width) */}
            <div className="mb-3">
              <Input
                className="h-10 w-full"
                placeholder="Search by name, company, city"
                value={local.q ?? ""}
                onChange={(e) => setLocal((s) => ({ ...s, q: e.target.value }))}
              />
            </div>

            {/* Filters content (branch/degree/year/sort/clear) */}
            {FiltersContent}
          </aside>
        </div>
      )}
    </div>
  );
}
