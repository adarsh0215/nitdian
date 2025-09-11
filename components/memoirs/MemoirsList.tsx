"use client";

/**
 * components/memoirs/MemoirsList.tsx
 *
 * - Centered header ("Loved by Alumni across Batches").
 * - Pagination bar (Prev/Next + "Showing X–Y of Z") above and below the grid.
 * - Card layout + expand/collapse identical to Featured.tsx.
 * - Defensive data mapping (works with /api/featured-memoirs or /api/memoirs).
 */

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type MemoirCard = {
  id: number;
  quote: string;
  author: string;
  role?: string;
  year?: number | string;
  avatar?: string | null;
  priority?: number | null;
  approved_at?: string | null;
};

type MemoirsInitial = {
  items: MemoirCard[];
  total: number;
  perPage: number;
  filters: { page: number };
};

export default function MemoirsList({ initial }: { initial: MemoirsInitial }) {
  return <MemoirsListWithPagination initial={initial} />;
}

/* ------------------------------
   Pagination-aware list
   ------------------------------ */
function MemoirsListWithPagination({ initial }: { initial: MemoirsInitial }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const items = initial.items ?? [];
  const total = initial.total ?? 0;
  const perPage = initial.perPage ?? 24;

  const pageParam = searchParams?.get("page");
  const currentPage = Math.max(1, Number(pageParam ?? initial.filters.page ?? 1));

  const fromIndex = (currentPage - 1) * perPage + 1;
  const toIndex = Math.min(currentPage * perPage, total);

  const [busy, setBusy] = React.useState(false);

  function onChangeFilters(next: { page: number }) {
    setBusy(true);
    const sp = new URLSearchParams(Array.from(searchParams?.entries() ?? []));
    sp.set("page", String(next.page));
    router.push(`${window.location.pathname}?${sp.toString()}`);
    setTimeout(() => setBusy(false), 500); // brief busy state
  }

  // Reusable pagination bar
  const PaginationBar = () => (
    <div className="flex items-center justify-between pt-2">
      <div className="text-sm text-muted-foreground">
        Showing {fromIndex}–{toIndex} of {total}
      </div>
      <div className="flex gap-2">
        <button
          className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={currentPage <= 1 || busy}
          onClick={() => onChangeFilters({ page: Math.max(1, currentPage - 1) })}
        >
          Previous
        </button>
        <button
          className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={currentPage * perPage >= total || busy}
          onClick={() => onChangeFilters({ page: currentPage + 1 })}
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <section className="space-y-8">
      {/* Header (centered) */}
      <div className="text-center mx-auto max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Loved by Alumni across Batches
        </h2>
        <p className="mt-2 text-muted-foreground">Appreciation, Motivation, and Encouragement.</p>
      </div>

      {/* Pagination (top) */}
      <PaginationBar />

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((it) => (
          <MemoirCard key={it.id} item={it} />
        ))}
      </div>

      {/* Pagination (bottom) */}
      <PaginationBar />
    </section>
  );
}

/* ------------------------------
   MemoirCard (same as FeaturedCard)
   ------------------------------ */
function MemoirCard({ item }: { item: MemoirCard }) {
  const [expanded, setExpanded] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const [collapsedMax, setCollapsedMax] = React.useState(0);
  const [contentHeight, setContentHeight] = React.useState(0);
  const [canExpand, setCanExpand] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const compute = () => {
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize || "16");
      const lh = cs.lineHeight === "normal" || !cs.lineHeight ? 1.5 * fs : parseFloat(cs.lineHeight);
      const max = Math.round(lh * 5 + 2);
      setCollapsedMax(max);
      setContentHeight(el.scrollHeight);
      setCanExpand(el.scrollHeight > max + 1);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [item.quote]);

  return (
    <article className="h-full rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md p-5 flex flex-col">
      <div className="relative min-w-0">
        <div
          ref={contentRef}
          style={{
            maxHeight: expanded ? contentHeight : collapsedMax,
            transition: "max-height 300ms ease",
            overflow: "hidden",
            willChange: "max-height",
          }}
          className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-line"
        >
          <span aria-hidden className="mr-1 text-xl inline-block select-none text-primary">
            “
          </span>
          {item.quote}
          <span aria-hidden className="ml-1 text-xl inline-block select-none text-primary">
            ”
          </span>
        </div>

        {!expanded && canExpand && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-card"
          />
        )}
      </div>

      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-3 ml-auto text-xs sm:text-sm font-medium underline underline-offset-4"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}

      <div className="mt-auto pt-4 border-t border-border/70 flex items-center gap-3">
        <Avatar className="h-10 w-10 bg-muted ring-2 ring-background">
          {item.avatar ? <AvatarImage src={item.avatar} alt={item.author} /> : null}
          <AvatarFallback className="text-xs font-medium">{initials(item.author)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-[15px] sm:text-base font-semibold leading-tight truncate">{item.author}</div>
          {item.role && <div className="text-sm text-muted-foreground leading-tight truncate">{item.role}</div>}
          {item.year && <div className="text-sm text-muted-foreground/90 leading-tight truncate">{item.year}</div>}
        </div>
      </div>
    </article>
  );
}

/* initials() — fallback for avatar */
function initials(name: string) {
  const n = (name || "").trim();
  if (!n) return "A";
  const [a, b] = n.split(/\s+/);
  return ((a?.[0] || "") + (b?.[0] || "")).toUpperCase();
}
