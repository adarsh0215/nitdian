// app/auth/callback/set/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

function assertEnv(name: string, value: string | undefined): asserts value is string {
  if (!value) throw new Error(`Missing env: ${name}`);
}

function bindSupabase(req: NextRequest, res: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  assertEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  assertEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anon);

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookies: { name: string; value: string; options?: CookieOptions }[]) {
        for (const { name, value, options } of cookies) {
          res.cookies.set(name, value, options);
        }
      },
    },
  });
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  const { access_token, refresh_token } = await req.json().catch(() => ({}));
  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing access_token/refresh_token" }, { status: 400 });
  }
  const supabase = bindSupabase(req, res);
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return res; // includes Set-Cookie
}
