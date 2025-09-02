"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DirectoryFilters } from "./DirectoryClient";

export default function ActiveFilters({
  filters,
  onClearOne,
  onClearAll,
}: {
  filters: DirectoryFilters;
  onClearOne: (key: keyof DirectoryFilters) => void;
  onClearAll: () => void;
}) {
  const chips: Array<{ key: keyof DirectoryFilters; label: string }> = [];
  if (filters.q) chips.push({ key: "q", label: `Search: ${filters.q}` });
  if (filters.branch) chips.push({ key: "branch", label: filters.branch });
  if (filters.degree) chips.push({ key: "degree", label: filters.degree });
  if (filters.year) chips.push({ key: "year", label: `Year: ${filters.year}` });
  if (filters.city) chips.push({ key: "city", label: `City: ${filters.city}` });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <span
          key={String(c.key)}
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
        >
          {c.label}
          <button
            type="button"
            onClick={() => onClearOne(c.key)}
            className="opacity-70 hover:opacity-100"
            aria-label={`Clear ${c.label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <Button size="sm" variant="ghost" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
}
