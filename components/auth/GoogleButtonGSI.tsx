"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

type GoogleCredentialResponse = { credential?: string };

interface GoogleAccountsId {
  initialize: (opts: {
    client_id: string;
    callback: (resp: GoogleCredentialResponse) => void;
    ux_mode?: "popup" | "redirect";
    auto_select?: boolean;
  }) => void;
  prompt?: (listener?: (notification: unknown) => void) => void;
}

type WindowWithGSI = Window & {
  google?: {
    accounts?: {
      id?: GoogleAccountsId;
    };
  };
};

export default function GoogleButtonGSI({ next }: { next?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);
  const supabase = supabaseBrowser();

  const resolvedNext =
    next && next.startsWith("/") && next !== "/" ? next : "/dashboard";

  const getClientId = () =>
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    (typeof window !== "undefined"
      ? (window as any).__NEXT_PUBLIC_GOOGLE_CLIENT_ID
      : undefined);

  const handleCredentialResponse = useCallback(
    async (resp: GoogleCredentialResponse) => {
      setError(null);
      setLoading(true);
      try {
        const idToken = resp?.credential;
        if (!idToken) throw new Error("No ID token from Google");

        const { error: signInError } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });
        if (signInError) throw signInError;

        window.location.href = resolvedNext;
      } catch (err) {
        console.error("GSI sign-in failed:", err);
        setError(err instanceof Error ? err.message : "Sign-in failed");
      } finally {
        setLoading(false);
      }
    },
    [resolvedNext, supabase]
  );

  const initGsi = useCallback(() => {
    if (initialized.current) return;
    const clientId = getClientId();
    if (!clientId) {
      setError("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }
    const win = window as unknown as WindowWithGSI;
    const gsi = win.google?.accounts?.id;
    if (!gsi) return;

    gsi.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      ux_mode: "popup",
      auto_select: false,
    });

    initialized.current = true;
  }, [handleCredentialResponse]);

  useEffect(() => {
    initGsi();
  }, [initGsi]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => initGsi()}
        onError={() => setError("Failed to load Google script")}
      />

      {/* Our always-full button (Google never injects UI now) */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => {
            const win = window as unknown as WindowWithGSI;
            const gsi = win.google?.accounts?.id;
            if (!gsi) {
              setError("Google auth not ready — refresh and try again.");
              return;
            }
            gsi.prompt?.();
          }}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-3 rounded-md border border-[#dadce0] bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            // Google G icon
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 533.5 544.3"
              aria-hidden
            >
              <path
                fill="#4285F4"
                d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.2H272v95h146.9c-6.4 34.7-25.6 64.1-54.6 83.7l88.4 68.7c51.7-47.7 80.8-118.1 80.8-197.2z"
              />
              <path
                fill="#34A853"
                d="M272 544.3c73.6 0 135.2-24.3 180.3-66.1l-88.4-68.7c-24.5 16.4-55.9 26.1-91.9 26.1-70.7 0-130.5-47.6-151.9-111.4l-91.7 70.7c44.2 87.5 135.3 149.4 243.6 149.4z"
              />
              <path
                fill="#FBBC05"
                d="M120.1 324.2c-10.8-32-10.8-66.1 0-98.1l-91.7-70.7C-26.6 219.4-26.6 324.9 28.4 417.2l91.7-70.7z"
              />
              <path
                fill="#EA4335"
                d="M272 107.7c39.9 0 75.8 13.7 104 40.8l78-78C407.1 24.5 345.6 0 272 0 163.7 0 72.6 61.9 28.4 149.6l91.7 70.7C141.5 155.3 201.3 107.7 272 107.7z"
              />
            </svg>
          )}
          <span>{loading ? "Signing in…" : "Continue with Google"}</span>
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </>
  );
}
