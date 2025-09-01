// lib/supabase/client.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";
// import type { Database } from "@/lib/supabase/types";

/** Narrows env var types for TS and throws if missing at runtime */
function assertEnv(name: string, value: string | undefined): asserts value is string {
  if (!value) {
    throw new Error(
      `Missing env: ${name}. Set it in .env.local and Vercel Project Settings (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).`
    );
  }
}

export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  assertEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  assertEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anon);

  return createBrowserClient/*<Database>*/(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });
}
