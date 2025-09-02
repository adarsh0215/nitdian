// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase/route";
import { safeRedirect } from "@/lib/redirects";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Split a potentially comma-joined Set-Cookie header and append to the redirect response.
function appendSetCookies(from: Response | NextResponse, to: NextResponse) {
  const raw = from.headers.get("set-cookie");
  if (!raw) return;
  const parts = raw.split(/,(?=\s*[^=;]+=[^;]+)/g);
  for (const c of parts) to.headers.append("Set-Cookie", c);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");   // e.g. access_denied
  const nextRaw = url.searchParams.get("next") ?? undefined;

  // Create Supabase server client bound to a response collector.
  const { supabase, response } = supabaseRoute(req);

  // 0) Provider error or missing code -> back to /login (preserve next + error)
  if (oauthError || !code) {
    const to = new URL("/login", req.url);
    if (nextRaw) to.searchParams.set("next", nextRaw);
    if (oauthError) to.searchParams.set("error", oauthError);
    return NextResponse.redirect(to);
  }

  // 1) Exchange the code for a session (Supabase will write cookies to `response`)
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const to = new URL("/login", req.url);
    if (nextRaw) to.searchParams.set("next", nextRaw);
    to.searchParams.set("error", error.message);
    const redirect = NextResponse.redirect(to);
    appendSetCookies(response, redirect);
    return redirect;
  }

  // 2) Decide destination
  // Prefer /dashboard unless `next` is a meaningful in-app path.
  // safeRedirect should already strip off- origin URLs; we also ignore root.
  const cleanedNext = safeRedirect(nextRaw);
  const effectiveNext = cleanedNext && cleanedNext !== "/" ? cleanedNext : undefined;

  let dest = "/dashboard";

  if (data?.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded,is_approved")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile?.onboarded) {
      dest = "/onboarding";
    // If you gate access by approval, uncomment:
    // } else if (profile?.is_approved === false) {
    //   dest = "/pending-approval";
    } else {
      dest = effectiveNext ?? "/dashboard";
    }
  }

  // 3) Redirect and ensure auth cookies are included
  const redirect = NextResponse.redirect(new URL(dest, req.url));
  appendSetCookies(response, redirect);
  return redirect;
}
