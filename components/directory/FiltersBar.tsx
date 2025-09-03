"use client";

import * as React from "react";
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

function yearsFrom(start = 1961) {
  const y = new Date().getFullYear();
  const arr: number[] = [];
  for (let i = y; i >= start; i--) arr.push(i);
  return arr;
}

export default function FiltersBar({
  initial,
  onChange,
  busy,
}: {
  initial: DirectoryFilters;
  onChange: (patch: Partial<DirectoryFilters>) => void;
  busy: boolean;
}) {
  const [local, setLocal] = React.useState<DirectoryFilters>(initial);

  // debounce the free-text search
  React.useEffect(() => {
    const t = setTimeout(() => onChange({ q: local.q, page: 1 }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.q]);

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* MAIN ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
        {/* Search */}
        <div className="sm:col-span-6 min-w-0">
          <Input
            className="w-full h-10"
            placeholder="Search by name, company, city"
            value={local.q ?? ""}
            onChange={(e) => setLocal((s) => ({ ...s, q: e.target.value }))}
          />
        </div>

        {/* Branch */}
        <div className="sm:col-span-3">
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
        <div className="sm:col-span-2">
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
        <div className="sm:col-span-1">
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
      </div>

      {/* SECONDARY ROW: Sort + Clear (right aligned) */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
        <div className="sm:w-64">
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
              <SelectItem value="name">Name A–Z</SelectItem>
              <SelectItem value="recent">Recently joined</SelectItem>
              <SelectItem value="year_desc">Grad year (newest)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="h-10 sm:w-auto w-full"
          disabled={busy}
          onClick={() => {
            const cleared = {
              q: "",
              // city remains cleared even if hidden
              city: undefined,
              branch: undefined,
              degree: undefined,
              year: undefined,
              sort: "name" as const,
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
}
