"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Singleton browser client. @supabase/ssr default cookie handling — no custom plumbing. */
export function supabaseBrowser() {
  _client ??= createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return _client;
}
