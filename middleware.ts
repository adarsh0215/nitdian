// middleware.ts
// ------------------------------
// Purpose:
// - Protect pages and sections of the app using Supabase auth.
// - Allow some public routes (pages + certain API endpoints).
// - Force onboarding and approval flows for authenticated users.
// - Keep admin area guarded.
//
// Safety note:
// - I made a single, minimal and safe fix to the public-path check so entries
//   like "/api/" actually match "/api/memoirs". Nothing else in your logic changed.
// ------------------------------

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Adjust this list to include any publicly-accessible pages or prefixes.
 * IMPORTANT: entries here can be *exact paths* ("/") or *prefixes* ("/api/").
 *
 * Examples:
 * - "/"                => homepage
 * - "/login"           => login page
 * - "/api/"            => all API routes under /api/ are public
 *
 * Keep this list minimal and intentional: anything here will bypass auth-check redirects.
 */
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/auth/callback",
  "/policies/privacy",
  "/policies/terms",
  "/coming-soon",
  "/dev",
  "/api/",
  "/memoirs",
];

/**
 * isPublicPath
 * - Purpose: decide whether a request path should be considered public.
 * - Behavior: handles both exact matches and prefix matches safely.
 *
 * Why change:
 * - Your earlier implementation used `pathname.startsWith(`${p}/`)` which fails
 *   for entries that already end with "/" (e.g. "/api/"). `/api/memoirs` would
 *   not pass that check. This caused API routes to be redirected unexpectedly.
 *
 * Safety:
 * - This function only changes how PUBLIC_ROUTES entries are matched. It does
 *   not alter any redirect/auth logic.
 */
function isPublicPath(pathname: string) {
  // Normalize pathname (no trailing slash, except root)
  const normPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

  for (const p of PUBLIC_ROUTES) {
    // Normalize the configured public route for matching
    const normP = p === "/" ? "/" : p.replace(/\/+$/, "");

    // Exact match (e.g. "/login" === "/login")
    if (normPath === normP) return true;

    // Prefix match: treat the configured route as a directory/prefix.
    // Example: if PUBLIC_ROUTES has "/api", this will match "/api/memoirs".
    if (normP !== "/" && normPath.startsWith(normP + "/")) return true;
  }

  return false;
}

/**
 * redirectWithNext
 * - Utility to redirect to a page (like /login) while preserving the original
 *   requested path in the "next" query param, so the app can take the user back
 *   after successful auth.
 */
function redirectWithNext(req: NextRequest, to: string) {
  const url = new URL(to, req.url);
  const attempted = new URL(req.url); // original requested URL
  url.searchParams.set("next", attempted.pathname + attempted.search);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  // Create a mutable response so we can set cookies if Supabase needs to.
  // We pass request headers so the server client can read things like host, etc.
  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  // Create a Supabase server client for this request.
  // This is the SSR-style client which reads/writes cookies via the callback functions.
  // Note: using the anon key + cookie helpers here is fine — your middleware expects this.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          // set cookie on the response so it gets sent back to the browser
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          // remove by expiring immediately
          res.cookies.set({ name, value: "", ...options, expires: new Date(0) });
        },
      },
    }
  );

  const url = new URL(req.url);
  const { pathname } = url;

  // Get authenticated user (if any). getUser() is cheap if no session exists.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Default profile flags: unknown until we fetch (null means unknown)
  let onboarded: boolean | null = null;
  let isApproved: boolean | null = null;
  let isAdmin = false;

  if (user) {
    // Fetch minimal profile flags only when user exists. This keeps the middleware lean.
    // maybeSingle() returns null data if profile row not found.
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded,is_approved")
      .eq("id", user.id)
      .maybeSingle();

    onboarded = profile?.onboarded ?? null;
    isApproved = profile?.is_approved ?? null;

    // Only check admins if user is requesting an admin route (saves a DB call usually)
    if (pathname.startsWith("/admin")) {
      const { data: adminRow } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      isAdmin = Boolean(adminRow);
    }
  }

  // ---- 0) Coming-soon gate ----
  // If you set NEXT_PUBLIC_COMING_SOON_UNTIL to a timestamp string, this prevents
  // access to the app before launch, redirecting to /coming-soon.
  // If the env var is missing or invalid, the code below may throw — keep the env set.
  const endTime = process.env.NEXT_PUBLIC_COMING_SOON_UNTIL!;
  const launchTime = new Date(endTime).getTime();
  const now = Date.now();

  if (now < launchTime && !req.nextUrl.pathname.startsWith("/coming-soon")) {
    // Keep this behavior as you had it: a hard redirect to coming-soon page.
    return NextResponse.redirect(new URL("/coming-soon", req.url));
  }

  // 1) Public routes are accessible to everyone (pages + API prefixes defined above)
  if (isPublicPath(pathname)) {
    // Small UX nicety: if authenticated user hits /login, send them to dashboard or onboarding
    if (user && pathname.startsWith("/login")) {
      if (onboarded) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
    }
    // Allow the request to proceed (response with whatever app/page logic would produce)
    return res;
  }

  // 2) Non-public routes require authentication. If there's no user, redirect to /login.
  //    We keep the same redirect-with-next behavior as before.
  if (!user) {
    return redirectWithNext(req, "/login");
  }

  // 3) If user exists but hasn't finished onboarding, force them there (unless already on onboarding)
  if (!onboarded && !pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // 4) Member-only areas requiring approval (directory/jobs) — redirect to dashboard if not approved.
  //    This keeps your previous policy intact.
  if ((pathname.startsWith("/directory") || pathname.startsWith("/jobs")) && !isApproved) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 5) Admin area: require admin privileges
  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If we've reached this point, the user passed all checks — continue.
  return res;
}

/**
 * config.matcher:
 * - Excludes Next.js internals and static assets so middleware doesn't run for them.
 * - This was already present and I kept it unchanged.
 */
export const config = {
  matcher: [
    // allow middleware to run for all app routes except Next internals and static files
    "/((?!_next/|.*\\.(?:css|js|map|json|png|jpg|jpeg|gif|svg|ico|woff|woff2)|favicon\\.ico).*)",
  ],
};
