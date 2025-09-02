// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Adjust as needed
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/auth/callback"];

function isPublicPath(pathname: string) {
  return PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function redirectWithNext(req: NextRequest, to: string) {
  const url = new URL(to, req.url);
  // Preserve where the user tried to go (path + search)
  const attempted = new URL(req.url);
  url.searchParams.set("next", attempted.pathname + attempted.search);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  // Create a mutable response so Supabase can write cookies to it
  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          // Remove by expiring immediately
          res.cookies.set({ name, value: "", ...options, expires: new Date(0) });
        },
      },
    }
  );

  const url = new URL(req.url);
  const { pathname } = url;

  // Get auth user (cheap) and, if present, fetch profile flags (one query)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let onboarded: boolean | null = null;
  let isApproved: boolean | null = null;
  let isAdmin = false;

  if (user) {
    // Fetch once; keep it lean (two flags only)
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded,is_approved")
      .eq("id", user.id)
      .maybeSingle();

    onboarded = profile?.onboarded ?? null;
    isApproved = profile?.is_approved ?? null;

    // Admin check only if needed later
    if (pathname.startsWith("/admin")) {
      const { data: adminRow } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      isAdmin = Boolean(adminRow);
    }
  }

  // 1) Public routes are accessible to everyone.
  if (isPublicPath(pathname)) {
    // Already-authenticated users shouldn't see /login
    if (user && pathname.startsWith("/login")) {
      if (onboarded) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
    }
    return res;
  }

  // 2) Non-public routes require auth → redirect to /login with next
  if (!user) {
    return redirectWithNext(req, "/login");
  }

  // 3) If user is not onboarded, force them to onboarding (except when they are already there)
  if (!onboarded && !pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // 4) Directory (and any other member-only area) requires approval
  //    Adjust this list if you want some sections available pre-approval.
  if ((pathname.startsWith("/directory") || pathname.startsWith("/jobs")) && !isApproved) {
    // Not approved yet → keep them on dashboard with a notice
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 5) Admin area requires admin privileges
  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

// Exclude static assets and the Next internals
export const config = {
  matcher: [
    "/((?!_next/|.*\\.(?:css|js|map|json|png|jpg|jpeg|gif|svg|ico|woff|woff2)|favicon\\.ico).*)",
  ],
};
