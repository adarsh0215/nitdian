// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

function assertEnv(
  name: string,
  value: string | undefined
): asserts value is string {
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

function toNextCookieOptions(
  opts?: CookieOptions
): NextCookieOptions | undefined {
  if (!opts) return undefined;
  const { domain, path, maxAge, expires, httpOnly, secure, sameSite } = opts;
  return {
    domain,
    path,
    maxAge,
    expires:
      typeof expires === "string"
        ? new Date(expires)
        : (expires as Date | undefined),
    httpOnly,
    secure,
    sameSite: (sameSite as NextCookieOptions["sameSite"]) ?? undefined,
  };
}

/**
 * Server-side supabase client factory.
 *
 * - Uses SUPABASE_SERVICE_ROLE_KEY if present (preferred), otherwise falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * - Awaits cookies() to obtain the request cookie store (fixes TS/runtime errors).
 */
export async function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  assertEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  const keyToUse = serviceKey ?? anon;
  assertEnv(
    serviceKey
      ? "SUPABASE_SERVICE_ROLE_KEY (preferred)"
      : "NEXT_PUBLIC_SUPABASE_ANON_KEY (fallback)",
    keyToUse
  );

  // IMPORTANT: await cookies() because in some runtimes cookies() returns a Promise.
  const cookieStore = await cookies();

  return createServerClient(url, keyToUse, {
    cookies: {
      // Read cookie value
      get(name: string) {
        const value = cookieStore.get(name)?.value;
        return value ? value : undefined;
      },
      // Set cookie using Next's single-object API
      set(name: string, value: string, options?: CookieOptions) {
        const mapped = toNextCookieOptions(options) ?? {};
        cookieStore.set({
          name,
          value,
          path: mapped.path,
          domain: mapped.domain,
          maxAge: mapped.maxAge,
          expires: mapped.expires,
          httpOnly: mapped.httpOnly,
          secure: mapped.secure,
          sameSite: mapped.sameSite as NextCookieOptions["sameSite"],
        });
      },

      // Remove cookie by setting an expired cookie (single-object API)
      remove(name: string, options?: CookieOptions) {
        const base = toNextCookieOptions(options) ?? { path: "/" };
        cookieStore.set({
          name,
          value: "",
          path: base.path,
          domain: base.domain,
          maxAge: 0,
          expires: new Date(0),
          httpOnly: base.httpOnly,
          secure: base.secure,
          sameSite: base.sameSite as NextCookieOptions["sameSite"],
        });
      },
    },
  });
}
