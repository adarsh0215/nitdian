// lib/supabase/client.ts
"use client";

import { createBrowserClient, type CookieOptions } from "@supabase/ssr";

function assertEnv(name: string, value: string | undefined): asserts value is string {
  if (!value) throw new Error(`Missing env: ${name}`);
}

// Read a cookie from document.cookie
function readCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

// Write a cookie (minimal, enough for Supabase auth cookies)
function writeCookie(name: string, value: string, options?: CookieOptions) {
  if (typeof document === "undefined") return;

  const parts: string[] = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options?.path ?? "/"}`,
  ];

  if (options?.domain) parts.push(`Domain=${options.domain}`);
  if (options?.maxAge) parts.push(`Max-Age=${options.maxAge}`);

  if (options?.expires) {
    const exp =
      typeof options.expires === "string"
        ? options.expires
        : (options.expires as Date).toUTCString();
    parts.push(`Expires=${exp}`);
  }

  if (options?.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options?.secure ?? (typeof location !== "undefined" && location.protocol === "https:")) {
    parts.push("Secure");
  }

  // Note: HttpOnly cannot be set from client-side JS; ignored by design.

  document.cookie = parts.join("; ");
}

// Remove a cookie
function removeCookie(name: string, options?: CookieOptions) {
  if (typeof document === "undefined") return;

  const parts: string[] = [
    `${name}=`,
    `Path=${options?.path ?? "/"}`,
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];

  if (options?.domain) parts.push(`Domain=${options.domain}`);
  if (options?.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options?.secure ?? (typeof location !== "undefined" && location.protocol === "https:")) {
    parts.push("Secure");
  }

  document.cookie = parts.join("; ");
}

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function supabaseBrowser() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  assertEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  assertEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anon);

  _client = createBrowserClient(url, anon, {
    // Read/write the same auth cookies as the server
    cookies: {
      get: readCookie,
      set: writeCookie,
      remove: removeCookie,
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });

  return _client;
}
