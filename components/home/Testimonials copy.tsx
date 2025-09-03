// "use client";

// import * as React from "react";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import type { TestimonialItem } from "./types";

// /* ======================== Main ======================== */

// /* =================== Small Carousel =================== */
// function SmallCarousel({ items }: { items: TestimonialItem[] }) {
//   // duplicate items for seamless loop
//   const loop = React.useMemo(() => (items.length ? [...items, ...items] : []), [items]);
//   const scrollerRef = React.useRef<HTMLDivElement>(null);
//   const hoverRef = React.useRef(false);
//   const intervalMs = 4000;

//   // autoplay: advance by one card every N ms; seamless wrap
//   React.useEffect(() => {
//     const el = scrollerRef.current;
//     if (!el || !items.length) return;

//     let timer: number | undefined;
//     let afterScrollTimer: number | undefined;

//     const getGap = () => {
//       const cs = getComputedStyle(el);
//       const g = parseFloat((cs as any).gap || (cs as any).columnGap || "16");
//       return Number.isFinite(g) ? g : 16;
//     };

//     const stepOnce = (dir: 1 | -1 = 1) => {
//       const firstChild = el.children[0] as HTMLElement | undefined;
//       if (!firstChild) return;
//       const step = firstChild.clientWidth + getGap();

//       el.scrollBy({ left: dir * step, behavior: "smooth" });

//       // after the smooth scroll ends, normalize position for seamless loop
//       afterScrollTimer && clearTimeout(afterScrollTimer);
//       afterScrollTimer = window.setTimeout(() => {
//         const half = el.scrollWidth / 2;
//         if (dir === 1 && el.scrollLeft >= half) {
//           el.scrollLeft = el.scrollLeft - half;
//         } else if (dir === -1 && el.scrollLeft < 0) {
//           el.scrollLeft = el.scrollLeft + half;
//         }
//       }, 500);
//     };

//     const tick = () => {
//       if (!hoverRef.current) stepOnce(1);
//       timer = window.setTimeout(tick, intervalMs);
//     };

//     timer = window.setTimeout(tick, intervalMs);

//     // pause on user scroll (wheel/touch)
//     const onPointer = () => {
//       hoverRef.current = true;
//       // resume a bit later
//       window.clearTimeout(timer);
//       timer = window.setTimeout(() => {
//         hoverRef.current = false;
//         tick();
//       }, 2500);
//     };

//     el.addEventListener("wheel", onPointer, { passive: true });
//     el.addEventListener("touchstart", onPointer, { passive: true });

//     return () => {
//       if (timer) window.clearTimeout(timer);
//       if (afterScrollTimer) window.clearTimeout(afterScrollTimer);
//       el.removeEventListener("wheel", onPointer);
//       el.removeEventListener("touchstart", onPointer);
//     };
//   }, [items]);

//   const scrollByOne = (dir: 1 | -1) => {
//     const el = scrollerRef.current;
//     if (!el) return;
//     const firstChild = el.children[0] as HTMLElement | undefined;
//     if (!firstChild) return;

//     const gap = (() => {
//       const cs = getComputedStyle(el);
//       const g = parseFloat((cs as any).gap || (cs as any).columnGap || "16");
//       return Number.isFinite(g) ? g : 16;
//     })();

//     const step = firstChild.clientWidth + gap;
//     el.scrollBy({ left: dir * step, behavior: "smooth" });
//   };

//   return (
//     <div
//       className="relative group"
//       role="region"
//       aria-label="Alumni testimonials carousel"
//       onMouseEnter={() => (hoverRef.current = true)}
//       onMouseLeave={() => (hoverRef.current = false)}
//     >
//       {/* Track */}
//       <div
//         ref={scrollerRef}
//         className="
//           flex gap-4 overflow-x-auto scroll-smooth no-scrollbar py-1
//           snap-x snap-mandatory [scroll-padding-inline:1rem]
//         "
//       >
//         {loop.map((t, i) => (
//           <Small
//             key={`${t.author}-${i}`}
//             item={t}
//             className="
//               snap-start
//               min-w-[calc(100%_-_3.5rem)]       /* mobile: 1 card + peek */
//               sm:min-w-[calc(50%_-_1.25rem)]    /* sm: 2 per view */
//               md:min-w-[calc(33.333%_-_1rem)]   /* md: 3 per view */
//               lg:min-w-[calc(25%_-_0.75rem)]    /* lg: 4 per view */
//             "
//           />
//         ))}
//       </div>

//       {/* edge fades */}
//       <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
//       <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />

//       {/* controls (show on sm+) */}
//       <button
//         type="button"
//         aria-label="Previous testimonials"
//         onClick={() => scrollByOne(-1)}
//         className="
//           hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2
//           h-9 w-9 items-center justify-center rounded-full border bg-card shadow
//           text-foreground/80 hover:text-foreground
//           opacity-0 group-hover:opacity-100 transition
//         "
//       >
//         ‹
//       </button>
//       <button
//         type="button"
//         aria-label="Next testimonials"
//         onClick={() => scrollByOne(1)}
//         className="
//           hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2
//           h-9 w-9 items-center justify-center rounded-full border bg-card shadow
//           text-foreground/80 hover:text-foreground
//           opacity-0 group-hover:opacity-100 transition
//         "
//       >
//         ›
//       </button>
//     </div>
//   );
// }

// /* --------------- Featured (expand/collapse) --------------- */
// function Featured({ item }: { item: TestimonialItem }) {
//   const [expanded, setExpanded] = React.useState(false);
//   const [collapsedMax, setCollapsedMax] = React.useState(0);
//   const [contentHeight, setContentHeight] = React.useState(0);
//   const [canExpand, setCanExpand] = React.useState(false);
//   const contentRef = React.useRef<HTMLDivElement>(null);

//   React.useLayoutEffect(() => {
//     const el = contentRef.current;
//     if (!el) return;

//     const compute = () => {
//       const cs = getComputedStyle(el);
//       const fs = parseFloat(cs.fontSize || "16");
//       const lhRaw = cs.lineHeight;
//       const lh = lhRaw === "normal" || !lhRaw ? 1.5 * fs : parseFloat(lhRaw);
//       const max = Math.round(lh * 4 + 2); // 4 lines
//       setCollapsedMax(max);
//       setContentHeight(el.scrollHeight);
//       setCanExpand(el.scrollHeight > max + 1);
//     };

//     compute();
//     const ro = new ResizeObserver(compute);
//     ro.observe(el);
//     window.addEventListener("resize", compute);
//     return () => {
//       ro.disconnect();
//       window.removeEventListener("resize", compute);
//     };
//   }, [item.quote]);

//   return (
//     <section className="rounded-3xl border border-border bg-muted p-4 sm:p-6 md:p-8">
//       <div
//         className="
//           grid gap-5 md:gap-8 items-start
//           md:[grid-template-columns:minmax(220px,_280px)_1fr]
//           lg:[grid-template-columns:280px_1fr]
//         "
//       >
//         {/* Left: avatar + identity */}
//         <div className="flex gap-4 md:flex-col md:items-center md:text-center">
//           <Avatar className="h-20 w-20 sm:h-24 sm:w-24 bg-card ring-4 ring-background shadow-sm">
//             {item.avatar ? <AvatarImage src={item.avatar} alt={item.author} /> : null}
//             <AvatarFallback className="text-lg font-semibold">
//               {initials(item.author)}
//             </AvatarFallback>
//           </Avatar>

//           <div className="min-w-0 space-y-1">
//             <div className="text-lg font-semibold leading-tight text-balance">
//               {item.author}
//             </div>
//             {item.role ? (
//               <div className="text-sm text-muted-foreground leading-tight">
//                 {item.role}
//               </div>
//             ) : null}
//           </div>
//         </div>

//         {/* Right: message */}
//         <blockquote className="rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-6 md:p-7 min-w-0 transition-shadow duration-300 hover:shadow-md">
//           <div className="relative">
//             <div
//               ref={contentRef}
//               style={{
//                 maxHeight: expanded ? contentHeight : collapsedMax,
//                 transition: "max-height 300ms ease",
//                 overflow: "hidden",
//                 willChange: "max-height",
//               }}
//               className="text-balance text-base sm:text-lg leading-relaxed"
//             >
//               <span aria-hidden className="mr-1 text-2xl align-top select-none text-primary">“</span>
//               {item.quote}
//               <span aria-hidden className="ml-1 text-2xl align-bottom select-none text-primary">”</span>
//             </div>

//             {!expanded && canExpand && (
//               <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-card" />
//             )}
//           </div>

//           {canExpand && (
//             <button
//               type="button"
//               onClick={() => setExpanded((v) => !v)}
//               aria-expanded={expanded}
//               className="mt-3 ml-auto block text-sm font-medium underline underline-offset-4"
//             >
//               {expanded ? "Read less" : "Read more"}
//             </button>
//           )}
//         </blockquote>
//       </div>
//     </section>
//   );
// }

// /* ------------------ Small card (item) ------------------ */
// function Small({
//   item,
//   className = "",
// }: {
//   item: TestimonialItem;
//   className?: string;
// }) {
//   const [expanded, setExpanded] = React.useState(false);
//   const [collapsedMax, setCollapsedMax] = React.useState(0);
//   const [contentHeight, setContentHeight] = React.useState(0);
//   const [canExpand, setCanExpand] = React.useState(false);
//   const contentRef = React.useRef<HTMLDivElement>(null);

//   React.useLayoutEffect(() => {
//     const el = contentRef.current;
//     if (!el) return;

//     const compute = () => {
//       const lh = parseFloat(getComputedStyle(el).lineHeight || "20");
//       const max = Math.round(lh * 4 + 2); // 4 lines
//       setCollapsedMax(max);
//       setContentHeight(el.scrollHeight);
//       setCanExpand(el.scrollHeight > max + 1);
//     };

//     compute();
//     const ro = new ResizeObserver(compute);
//     ro.observe(el);
//     window.addEventListener("resize", compute);
//     return () => {
//       ro.disconnect();
//       window.removeEventListener("resize", compute);
//     };
//   }, [item.quote]);

//   return (
//     <article
//       className={[
//         "rounded-2xl border border-border bg-card p-4 sm:p-5 h-full",
//         "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
//         "flex flex-col",
//         "min-h-[16rem] sm:min-h-[15rem]",
//         className,
//       ].join(" ")}
//     >
//       {/* Quote */}
//       <div className="relative min-w-0">
//         <div
//           ref={contentRef}
//           style={{
//             maxHeight: expanded ? contentHeight : collapsedMax,
//             transition: "max-height 300ms ease",
//             overflow: "hidden",
//             willChange: "max-height",
//           }}
//           className="text-sm sm:text-base leading-relaxed break-words"
//         >
//           <span aria-hidden className="mr-1 text-xl align-top select-none text-primary">“</span>
//           {item.quote}
//           <span aria-hidden className="ml-1 text-xl align-bottom select-none text-primary">”</span>
//         </div>

//         {!expanded && canExpand && (
//           <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-card" />
//         )}
//       </div>

//       {/* Toggle */}
//       {canExpand && (
//         <button
//           type="button"
//           onClick={() => setExpanded((v) => !v)}
//           aria-expanded={expanded}
//           className="mt-3 ml-auto text-xs sm:text-sm font-medium underline underline-offset-4"
//         >
//           {expanded ? "Read less" : "Read more"}
//         </button>
//       )}

//       {/* Footer */}
//       <div className="mt-auto pt-4 border-t border-border/70">
//         <div className="flex items-center gap-3 min-w-0">
//           <Avatar className="h-8 w-8 sm:h-9 sm:w-9 bg-muted ring-2 ring-background">
//             {item.avatar ? <AvatarImage src={item.avatar} alt={item.author} /> : null}
//             <AvatarFallback className="text-[10px] sm:text-xs font-medium">
//               {initials(item.author)}
//             </AvatarFallback>
//           </Avatar>
//           <div className="min-w-0">
//             <div className="text-sm sm:text-base font-medium leading-tight truncate">
//               {item.author}
//             </div>
//             {item.role ? (
//               <div className="text-xs sm:text-sm text-muted-foreground leading-tight truncate">
//                 {item.role}
//               </div>
//             ) : null}
//           </div>
//         </div>
//       </div>
//     </article>
//   );
// }

// /* --------------------- Helpers --------------------- */
// function initials(name: string) {
//   const first = (name || "").trim().charAt(0).toUpperCase();
//   return first || "A";
// }
