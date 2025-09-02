"use client";

import * as React from "react";
import { X } from "lucide-react";
import type { DirectoryFilters } from "./DirectoryClient";

type FilterKey = "q" | "branch" | "degree" | "year";

export default function ActiveFilters({
  filters,
  onClearOne,
  onClearAll,
}: {
  filters: DirectoryFilters;
  onClearOne: (key: FilterKey) => void;
  onClearAll: () => void;
}) {
  const chips: Array<{ key: FilterKey; label: string }> = [];

  if (filters.q) chips.push({ key: "q", label: `Search: ${filters.q}` });
  if (filters.branch) chips.push({ key: "branch", label: filters.branch });
  if (filters.degree) chips.push({ key: "degree", label: filters.degree });
  if (typeof filters.year === "number")
    chips.push({ key: "year", label: `Year: ${filters.year}` });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={`${chip.key}-${chip.label}`}
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs leading-4 text-muted-foreground"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onClearOne(chip.key)}
            className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted"
            aria-label={`Clear ${chip.key}`}
            title="Remove filter"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="text-xs underline text-muted-foreground hover:text-foreground"
        aria-label="Clear all filters"
      >
        Clear all
      </button>
    </div>
  );
}
