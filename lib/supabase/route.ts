// lib/supabase/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

function assertEnv(name: string, value: string | undefined): asserts value is string {
  if (!value) throw new Error(`Missing env: ${name}`);
}

/**
 * Route handler helper. Always return the `response` you get back
 * so Supabase can write refreshed cookies.
 *
 * Example:
 * export async function GET(req: NextRequest) {
 *   const { supabase, response } = supabaseRoute(req);
 *   await supabase.auth.getUser();
 *   return response; // <- IMPORTANT
 * }
 */
export function supabaseRoute(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  assertEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  assertEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anon);

  const response = NextResponse.next();

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        // Pass through request cookies
        return req.cookies.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookies: { name: string; value: string; options?: CookieOptions }[]) {
        // Attach any cookies Supabase wants to set onto the response
        for (const { name, value, options } of cookies) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  return { supabase, response };
}
