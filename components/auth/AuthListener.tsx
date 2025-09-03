"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthListener() {
  const router = useRouter();

  // A tiny, long-lived browser client just for listening to auth changes.
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(() => {
        // Pull a fresh RSC payload so the header/pill re-renders with the new session.
        router.refresh();
      });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  return null;
}
