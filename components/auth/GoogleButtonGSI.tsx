// components/auth/GoogleButtonGSI.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Local GSI types (keeps this file self-contained and avoids `any`)
 */
type GoogleCredentialResponse = { credential?: string };

interface GoogleAccountsId {
  initialize: (opts: {
    client_id: string;
    callback: (resp: GoogleCredentialResponse) => void;
    ux_mode?: "popup" | "redirect";
  }) => void;
  renderButton: (el: HTMLElement, options?: Record<string, unknown>) => void;
  prompt?: (listener?: (notification: unknown) => void) => void;
}

interface WindowWithGSI extends Window {
  google?: {
    accounts?: {
      id?: GoogleAccountsId;
    };
  };
}

export default function GoogleButtonGSI({ next }: { next?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State that drives whether fallback shows; true after GSI renders official button
  const [gsiRendered, setGsiRendered] = useState(false);

  const renderedRef = useRef(false); // idempotence guard for renderButton
  const initialized = useRef(false);
  const supabase = supabaseBrowser();

  // Resolve redirect path
  const resolvedNext = (() => {
    try {
      if (next && next !== "/" && next.startsWith("/") && !next.startsWith("//")) return next;
      if (typeof window !== "undefined") {
        const sp = new URLSearchParams(window.location.search);
        const q = sp.get("next");
        if (q && q !== "/" && q.startsWith("/") && !q.startsWith("//")) return q;
      }
    } catch {
      // ignore
    }
    return "/dashboard";
  })();

  const getClientId = () => {
    return typeof window !== "undefined"
      ? (window as unknown as Window & { __NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string }).__NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      : process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  };

  const initGsi = useCallback(
    (cb?: () => void) => {
      const clientId = getClientId();
      if (!clientId) {
        setError("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID (check .env.local / Vercel envs)");
        console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
        return;
      }

      const win = window as unknown as WindowWithGSI;
      const gsi = win.google?.accounts?.id;
      if (!gsi) return; // script not loaded yet

      if (initialized.current) {
        cb?.();
        return;
      }

      try {
        gsi.initialize({
          client_id: clientId,
          callback: (resp: GoogleCredentialResponse) => {
            // call the handler
            void handleCredentialResponse(resp);
          },
          ux_mode: "popup",
        });

        const el = document.getElementById("gsi-btn");
        if (el && !renderedRef.current) {
          // Ask GSI to render. We still set container styles so injected element fills width.
          gsi.renderButton(el as HTMLElement, {
            theme: "outline",
            size: "large",
          });

          // mark as rendered (ref for idempotence, state to trigger re-render)
          renderedRef.current = true;
          setGsiRendered(true);
        }

        initialized.current = true;
        cb?.();
      } catch (err) {
        // keep error typed as unknown
        console.error("GSI initialize error", err);
        setError("Failed to initialize Google Identity");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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

        // success — redirect
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

  // Try to initialize periodically, in case the script loads slightly later
  useEffect(() => {
    const id = setInterval(() => {
      initGsi();
      if (initialized.current) clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, [initGsi]);

  useEffect(() => {
    initGsi();
  }, [initGsi]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          initGsi();
        }}
        onError={(e) => {
          console.error("Google Identity script failed to load", e);
          setError("Failed to load Google script");
        }}
      />

      {/* Official Google button rendered here by GSI
          Tailwind child selector forces Google-inserted element to full width and centered.
          The injected structure by GSI is usually a div > div > button, so this targets the direct child. */}
      <div
        id="gsi-btn"
        className="w-full [&>div]:w-full [&>div]:flex [&>div]:justify-center"
      />

      {/* Fallback button: show ONLY if GSI hasn't rendered the official button yet */}
      {!gsiRendered ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              const win = window as unknown as WindowWithGSI;
              const gsi = win.google?.accounts?.id;
              if (!gsi) {
                setError("Google auth not ready — please refresh the page.");
                return;
              }
              if (!initialized.current) {
                initGsi(() => {
                  try {
                    gsi.prompt?.();
                  } catch (e) {
                    console.error("Prompt error after init", e);
                    setError("Google prompt failed");
                  }
                });
              } else {
                try {
                  gsi.prompt?.();
                } catch (e) {
                  console.error("Prompt error", e);
                  setError("Google prompt failed");
                }
              }
            }}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-3 rounded-md border border-[#dadce0] bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed transition"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>{loading ? "Signing in…" : "Continue with Google"}</span>
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </>
  );
}
