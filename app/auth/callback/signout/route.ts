// app/auth/callback/signout/route.ts
import { NextResponse } from "next/server";

// Names used by @supabase/ssr (v2) for auth cookies.
// Clearing these is enough to log the server out.
const SUPABASE_COOKIE_NAMES = [
  "sb-access-token",
  "sb-refresh-token",
  // Some setups also keep a combined cookie:
  "supabase-auth-token",
];

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // Clear all known Supabase auth cookies
  for (const name of SUPABASE_COOKIE_NAMES) {
    res.cookies.set({
      name,
      value: "",
      maxAge: 0,
      path: "/",        // clear for entire site
      httpOnly: true,   // matches how they were set
      sameSite: "lax",  // safe default
    });
  }

  return res;
}
