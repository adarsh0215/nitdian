// components/auth/GoogleButtonGSI.tsx
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
    auto_select?: boolean; // <- added
  }) => void;
  renderButton: (el: HTMLElement, options?: Record<string, unknown>) => void;
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
  const [gsiRendered, setGsiRendered] = useState(false);
  const renderedRef = useRef(false);
  const initialized = useRef(false);
  const supabase = supabaseBrowser();

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

  const getClientId = () =>
    typeof window !== "undefined"
      ? (window as unknown as Window & { __NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string }).__NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      : process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const enforceFullWidth = useCallback(() => {
    const el = document.getElementById("gsi-btn");
    if (!el) return false;
    const btn = el.querySelector("button");
    if (!btn) return false;
    (btn as HTMLButtonElement).style.width = "100%";
    (btn as HTMLButtonElement).style.maxWidth = "100%";
    (btn as HTMLButtonElement).style.display = "flex";
    (btn as HTMLButtonElement).style.justifyContent = "center";
    (btn as HTMLButtonElement).style.alignItems = "center";
    (btn as HTMLButtonElement).style.paddingLeft = "0.75rem";
    (btn as HTMLButtonElement).style.paddingRight = "0.75rem";
    return true;
  }, []);

  useEffect(() => {
    const container = document.getElementById("gsi-btn");
    if (!container) return;

    if (enforceFullWidth()) return;

    const observer = new MutationObserver(() => {
      if (enforceFullWidth()) observer.disconnect();
    });
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [enforceFullWidth]);

  const initGsi = useCallback(
    (cb?: () => void) => {
      const clientId = getClientId();
      if (!clientId) {
        setError("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID (check .env.local / Vercel envs)");
        return;
      }

      const win = window as unknown as WindowWithGSI;
      const gsi = win.google?.accounts?.id;
      if (!gsi) return;

      if (initialized.current) {
        cb?.();
        return;
      }

      try {
        // IMPORTANT: set auto_select: false so Google doesn't show the compact auto-select
        gsi.initialize({
          client_id: clientId,
          callback: (resp: GoogleCredentialResponse) => {
            void handleCredentialResponse(resp);
          },
          ux_mode: "popup",
          auto_select: false, // <- prevents the compact account-chooser flash
        });

        const el = document.getElementById("gsi-btn");
        if (el && !renderedRef.current) {
          // render the standard Google button (we still enforce full width via CSS/JS)
          gsi.renderButton(el as HTMLElement, { theme: "outline", size: "large" });

          renderedRef.current = true;
          setGsiRendered(true);

          // nudge enforcement after render (observer still running)
          setTimeout(() => enforceFullWidth(), 50);
        }

        initialized.current = true;
        cb?.();
      } catch (err) {
        console.error("GSI initialize error", err);
        setError("Failed to initialize Google Identity");
      }
    },
    [enforceFullWidth]
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
      {/* Inline CSS to force any injected GSI button to be full-width immediately. */}
      <style>{`
        #gsi-btn button,
        #gsi-btn div > button,
        #gsi-btn div div > button,
        #gsi-btn > div > div > button {
          width: 100% !important;
          max-width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          padding-left: 0.75rem !important;
          padding-right: 0.75rem !important;
        }
      `}</style>

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

      {/* container for Google-injected button */}
      <div id="gsi-btn" className="w-full" />

      {/* fallback: only visible while GSI hasn't rendered */}
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
