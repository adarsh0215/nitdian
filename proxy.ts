// proxy.ts (Next 16 rename of middleware.ts)
// One job: refresh the Supabase session cookie and require auth outside public routes.
// Onboarded/approved gating lives in the pages that need it (dashboard, directory, profile).
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Exact paths or prefixes. Everything else requires a signed-in user.
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/auth/callback",
  "/policies",
  "/coming-soon",
  "/api",
  "/memoirs",
];

function isPublicPath(pathname: string) {
  return PUBLIC_ROUTES.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/"))
  );
}

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Also refreshes an expired session and writes the new cookies onto `res`.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = req.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  // Signed-in users don't need the auth pages.
  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/|.*\\.(?:css|js|map|json|png|jpg|jpeg|gif|svg|ico|woff|woff2)|favicon\\.ico).*)",
  ],
};
