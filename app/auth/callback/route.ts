// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/route";
import { safeRedirect } from "@/lib/redirects";

export async function GET(req: NextRequest) {
  const { supabase, response } = supabaseRoute(req);
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error"); // e.g., access_denied
  const nextRaw = url.searchParams.get("next");

  // If provider returned an error or no code, back to login (preserve next)
  if (oauthError || !code) {
    const to = new URL("/login", req.url);
    if (nextRaw) to.searchParams.set("next", nextRaw);
    if (oauthError) to.searchParams.set("error", oauthError);
    return NextResponse.redirect(to);
  }

  // 1) Exchange the code -> sets cookies on `response` via supabaseRoute's setAll
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const to = new URL("/login", req.url);
    if (nextRaw) to.searchParams.set("next", nextRaw);
    to.searchParams.set("error", error.message);
    // propagate any cookies (even on error)
    const redirect = NextResponse.redirect(to);
    const setCookies = response.headers.getSetCookie();
    if (setCookies) {
      // `getSetCookie()` can be a comma-joined list; append safely
      for (const c of Array.isArray(setCookies) ? setCookies : [setCookies]) {
        redirect.headers.append("Set-Cookie", c);
      }
    }
    return redirect;
  }

  // 2) Decide destination
  let dest = "/dashboard";
  const next = safeRedirect(nextRaw);

  if (data?.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded,is_approved")
      .eq("id", data.user.id)
      .maybeSingle();

    // Not onboarded => go finish onboarding
    if (!profile?.onboarded) {
      dest = "/onboarding";
    } else {
      dest = next ?? "/dashboard";
    }
  }

  // 3) Return a redirect that ALSO includes the Set-Cookie headers produced earlier
  const redirect = NextResponse.redirect(new URL(dest, req.url));
  const setCookies = response.headers.getSetCookie();
  if (setCookies) {
    for (const c of Array.isArray(setCookies) ? setCookies : [setCookies]) {
      redirect.headers.append("Set-Cookie", c);
    }
  }
  return redirect;
}
