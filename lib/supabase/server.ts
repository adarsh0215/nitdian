// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

function assertEnv(name: string, value: string | undefined): asserts value is string {
  if (!value) throw new Error(`Missing env: ${name}`);
}

type NextCookieOptions = {
  domain?: string;
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
};

function toNextCookieOptions(opts?: CookieOptions): NextCookieOptions | undefined {
  if (!opts) return undefined;
  const { domain, path, maxAge, expires, httpOnly, secure, sameSite } = opts;
  return {
    domain,
    path,
    maxAge,
    expires: typeof expires === "string" ? new Date(expires) : (expires as Date | undefined),
    httpOnly,
    secure,
    sameSite: sameSite as NextCookieOptions["sameSite"] | undefined,
  };
}

export async function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  assertEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  assertEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anon);

  // In your env, cookies() is async
  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        const mapped = toNextCookieOptions(options);
        mapped ? cookieStore.set(name, value, mapped) : cookieStore.set(name, value);
      },
      remove(name: string, options?: CookieOptions) {
        const base = toNextCookieOptions(options) ?? { path: "/" };
        cookieStore.set(name, "", { ...base, maxAge: 0, expires: new Date(0) });
      },
    },
  });
}
