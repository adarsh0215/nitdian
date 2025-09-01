// lib/supabase/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

function assertEnv(name: string, value: string | undefined): asserts value is string {
  if (!value) throw new Error(`Missing env: ${name}`);
}

export function supabaseRoute(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  assertEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  assertEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anon);

  const response = NextResponse.next();

  const supabase = createServerClient(url, anon, {
    cookies: {
      // Route Handler variant uses getAll/setAll
      getAll() {
        // map NextRequest cookies -> { name, value }
        return req.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(cookies) {
        // apply cookies onto the NextResponse we’ll return
        cookies.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as CookieOptions | undefined);
        });
      },
    },
  });

  return { supabase, response };
}
