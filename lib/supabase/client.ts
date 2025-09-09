// lib/supabase/client.ts
"use client";

/**
 * This file initializes and exports a single instance of the Supabase client
 * for use on the **browser side** (client components).
 *
 * - Handles reading/writing/removing Supabase auth cookies.
 * - Ensures only ONE client instance is created (singleton pattern).
 * - Uses environment variables securely with validation.
 */

import { createBrowserClient, type CookieOptions } from "@supabase/ssr";

/**
 * Helper to ensure environment variables are present.
 * If a required env variable is missing, it throws a descriptive error.
 */
function assertEnv(name: string, value: string | undefined): asserts value is string {
  if (!value) throw new Error(`Missing env: ${name}`);
}

/**
 * Reads a cookie value from the browser's document.cookie.
 * Returns undefined if running server-side or cookie doesn't exist.
 */
function readCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/**
 * Writes a cookie in the browser with minimal options
 * (only the essentials for Supabase auth).
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Optional cookie settings like domain, path, etc.
 */
function writeCookie(name: string, value: string, options?: CookieOptions) {
  if (typeof document === "undefined") return;

  const parts: string[] = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options?.path ?? "/"}`,
  ];

  if (options?.domain) parts.push(`Domain=${options.domain}`);
  if (options?.maxAge) parts.push(`Max-Age=${options.maxAge}`);

  // Handle expiration date
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

  // HttpOnly cannot be set from JavaScript, so it's intentionally omitted.
  document.cookie = parts.join("; ");
}

/**
 * Removes a cookie by setting its expiration date to the past.
 */
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

// Hold a single shared instance of the Supabase client
let _client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Returns a singleton Supabase browser client.
 *
 * - Reads required env variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
 * - Configures Supabase to handle authentication and session persistence in the browser.
 */
export function supabaseBrowser() {
  if (_client) return _client; // Return existing instance if already created

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate that required env vars are present
  assertEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  assertEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anon);

  // Create a new Supabase client with custom cookie handling
  _client = createBrowserClient(url, anon, {
    cookies: {
      get: readCookie,
      set: writeCookie,
      remove: removeCookie,
    },
    auth: {
      persistSession: true,        // Persist the user's session automatically
      autoRefreshToken: true,      // Refresh tokens automatically when expired
      detectSessionInUrl: true,    // Detect OAuth login flow from the URL
      flowType: "pkce",            // Use PKCE for secure OAuth flows
    },
  });

  return _client;
}
