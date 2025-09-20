// components/auth/GoogleButtonGSI.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function GoogleButtonGSI({ next }: { next?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State that drives rendering of the fallback button.
  // When true, the official GSI button has been rendered and the fallback will be hidden.
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
    } catch {}
    return "/dashboard";
  })();

  const getClientId = () => {
    return typeof window !== "undefined"
      ? (window as any).__NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
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

      const gsi = (window as any).google?.accounts?.id;
      if (!gsi) return; // script not loaded yet

      if (initialized.current) {
        cb?.();
        return;
      }

      try {
        gsi.initialize({
          client_id: clientId,
          callback: (resp: { credential?: string }) => {
            (handleCredentialResponse as any)(resp);
          },
          ux_mode: "popup",
        });

        const el = document.getElementById("gsi-btn");
        if (el && !renderedRef.current) {
          gsi.renderButton(el as HTMLElement, {
            theme: "outline",
            size: "large",
            width: "100%",
          });

          // mark as rendered (ref for idempotence, state to trigger re-render)
          renderedRef.current = true;
          setGsiRendered(true);
        }

        initialized.current = true;
        cb?.();
      } catch (err) {
        console.error("GSI initialize error", err);
        setError("Failed to initialize Google Identity");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleCredentialResponse = useCallback(
    async (resp: { credential?: string }) => {
      setError(null);
      setLoading(true);
      try {
        const idToken = resp?.credential;
        if (!idToken) throw new Error("No ID token from Google");

        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });
        if (error) throw error;

        window.location.href = resolvedNext;
      } catch (err: any) {
        console.error("GSI sign-in failed:", err);
        setError(err?.message ?? "Sign-in failed");
      } finally {
        setLoading(false);
      }
    },
    [resolvedNext, supabase]
  );

  // Periodically try to initialize in case the script loads slightly later
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

      {/* Official Google button rendered here by GSI */}
      <div id="gsi-btn" />

      {/* Fallback button: show ONLY if GSI hasn't rendered the official button yet */}
      {!gsiRendered ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              const tryPrompt = () => {
                const gsi = (window as any).google?.accounts?.id;
                if (!gsi) {
                  setError("Google auth not ready — please refresh the page.");
                  return;
                }
                if (!initialized.current) {
                  initGsi(() => {
                    try {
                      (window as any).google.accounts.id.prompt?.();
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
              };

              tryPrompt();
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
