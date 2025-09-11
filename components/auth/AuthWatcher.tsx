// components/AuthWatcher.tsx
"use client";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// LocalStorage keys
const LS_LAST_SEEN_USER = "auth:last_seen_user_id";
const LS_LAST_LOGGED = "auth:last_logged";
const LS_LAST_USER_EMAIL = "auth:last_user_email";

// dedupe window (ms)
const DEDUPE_WINDOW_MS = 8000;

// short-lived claim TTL (not strictly enforced server side — used for coordination)
const CLAIM_TTL_MS = 5000;

type LastLogged = { user_id: string | null; action: string; ts: number };

// Cross-tab message shape (we accept extra props but these are the known ones)
type CrossTabMessage = {
  type: "sign_in" | "sign_out";
  user_id?: string | null;
  user_email?: string | null;
  ts?: number;
  [k: string]: unknown;
};

// Auth session minimal shape used from Supabase callbacks
type AuthSessionShape = {
  user?: { id?: string; email?: string } | null;
} | null;

// Per-tab id (use crypto.randomUUID when available)
const TAB_ID = (() => {
  try {
    const g = globalThis as typeof globalThis & { crypto?: Crypto & { randomUUID?: () => string } };
    if (g.crypto?.randomUUID) return g.crypto.randomUUID();
    return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  } catch {
    return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }
})();

function readLastSeenUser(): string | null {
  try {
    const v = localStorage.getItem(LS_LAST_SEEN_USER);
    return v && v.length ? v : null;
  } catch {
    return null;
  }
}
function writeLastSeenUser(id: string | null) {
  try {
    if (id) localStorage.setItem(LS_LAST_SEEN_USER, id);
    else localStorage.removeItem(LS_LAST_SEEN_USER);
  } catch {}
}

function readLastLogged(): LastLogged | null {
  try {
    const s = localStorage.getItem(LS_LAST_LOGGED);
    if (!s) return null;
    return JSON.parse(s) as LastLogged;
  } catch {
    return null;
  }
}
function saveLastLogged(entry: LastLogged) {
  try {
    localStorage.setItem(LS_LAST_LOGGED, JSON.stringify(entry));
  } catch {}
}

// visible-tab helper
function isTabVisible() {
  try {
    return typeof document !== "undefined" && document.visibilityState === "visible";
  } catch {
    return true;
  }
}

/**
 * Claiming helper — last-writer-wins claim in localStorage.
 * payload is stored for observability; ttl controls how recent the claim must be.
 */
function tryClaim(claimKey: string, payload: Record<string, unknown>, ttl = CLAIM_TTL_MS): boolean {
  try {
    const record = { tab: TAB_ID, ts: Date.now(), payload };
    localStorage.setItem(claimKey, JSON.stringify(record));
  } catch {
    return false;
  }

  try {
    const raw = localStorage.getItem(claimKey);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { tab?: string; ts?: number } | null;
    if (parsed && parsed.tab === TAB_ID && Date.now() - (parsed.ts ?? 0) < ttl) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Cross-tab notifier: BroadcastChannel preferred, storage fallback
 * onMessage receives a validated CrossTabMessage.
 */
const CHANNEL_NAME = "auth-log-channel";
function createNotifier(onMessage: (msg: CrossTabMessage) => void) {
  let bc: BroadcastChannel | null = null;
  const fallbackKey = "auth-log-fallback";
  const fallbackCleanupKey = "auth-log-fallback-cleanup";

  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (ev: MessageEvent) => {
        const d = ev.data;
        if (!d) return;
        // runtime-validate and forward
        if (isCrossTabMessage(d)) onMessage(d);
      };
    } catch {
      bc = null;
    }
  }

  function storageListener(e: StorageEvent) {
    if (e.key === fallbackKey && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (isCrossTabMessage(parsed)) onMessage(parsed);
      } catch {}
    }
  }

  if (!bc) {
    window.addEventListener("storage", storageListener);
  }

  function send(msg: Record<string, unknown>) {
    if (bc) {
      try {
        bc.postMessage(msg);
        return;
      } catch {}
    }

    try {
      localStorage.setItem(fallbackKey, JSON.stringify(msg));
      localStorage.setItem(fallbackCleanupKey, String(Date.now()));
      setTimeout(() => {
        try {
          localStorage.removeItem(fallbackKey);
          localStorage.removeItem(fallbackCleanupKey);
        } catch {}
      }, 500);
    } catch {}
  }

  return {
    send,
    close() {
      if (bc) {
        try {
          bc.close();
        } catch {}
      } else {
        window.removeEventListener("storage", storageListener);
      }
    },
  };
}

// runtime type guard for CrossTabMessage
function isCrossTabMessage(v: unknown): v is CrossTabMessage {
  if (!v || typeof v !== "object") return false;
  const t = (v as Record<string, unknown>)["type"];
  return t === "sign_in" || t === "sign_out";
}

export default function AuthWatcher() {
  useEffect(() => {
    const notifier = createNotifier((msg) => {
      try {
        // msg is CrossTabMessage (validated by createNotifier)
        const { type, user_id, ts, user_email } = msg;
        const now = Date.now();
        if (type === "sign_in") {
          writeLastSeenUser(user_id ?? null);
          saveLastLogged({ user_id: user_id ?? null, action: "sign_in", ts: ts ?? now });
          if (user_email) {
            try {
              localStorage.setItem(LS_LAST_USER_EMAIL, user_email);
            } catch {}
          }
        } else if (type === "sign_out") {
          saveLastLogged({ user_id: user_id ?? null, action: "sign_out", ts: ts ?? now });
          writeLastSeenUser(null);
          if (user_email) {
            try {
              localStorage.setItem(LS_LAST_USER_EMAIL, user_email);
            } catch {}
          }
        }
      } catch {
        // swallow notifier errors
      }
    });

    // supabase onAuthStateChange handler
    const { data: sub } = supabase.auth.onAuthStateChange(async (event: string, session: AuthSessionShape) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT") return;
      const now = Date.now();

      const currentUserId = session?.user?.id ?? null;
      const currentUserEmail = session?.user?.email ?? null;

      const lastSeen = readLastSeenUser();
      const lastLogged = readLastLogged();

      // SIGNED_IN
      if (event === "SIGNED_IN") {
        // quick dedupe
        if (lastSeen && lastSeen === currentUserId) {
          try {
            if (currentUserEmail) localStorage.setItem(LS_LAST_USER_EMAIL, currentUserEmail);
          } catch {}
          return;
        }

        if (
          lastLogged &&
          lastLogged.user_id === currentUserId &&
          lastLogged.action === "sign_in" &&
          now - lastLogged.ts < DEDUPE_WINDOW_MS
        ) {
          writeLastSeenUser(currentUserId);
          return;
        }

        // Update local markers first
        writeLastSeenUser(currentUserId);
        try {
          if (currentUserEmail) localStorage.setItem(LS_LAST_USER_EMAIL, currentUserEmail);
        } catch {}
        saveLastLogged({ user_id: currentUserId, action: "sign_in", ts: now });

        // Notify other tabs
        try {
          notifier.send({ type: "sign_in", user_id: currentUserId, user_email: currentUserEmail, ts: now });
        } catch {}

        // Coordination: prefer visible tab, then claim if multiple visible or race
        const claimKey = "auth:claim_sign_in";
        const payload: Record<string, unknown> = { user_id: currentUserId, user_email: currentUserEmail, ts: now };

        // If tab visible, attempt to claim and post; if not visible, attempt claim only
        const shouldAttemptPost = isTabVisible();

        // try to claim — only the claimed tab performs the POST
        const claimed = tryClaim(claimKey, payload, CLAIM_TTL_MS);

        if (claimed && shouldAttemptPost) {
          // we won the claim and are visible -> do network POST
          try {
            await fetch("/api/log-event", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: currentUserId, user_email: currentUserEmail, action: "sign_in" }),
            });
          } catch (err) {
            console.error("AuthWatcher: failed to post sign_in", err);
            // even if POST fails, other tabs will know via saved markers and notifier
          }
        } else {
          // if not claimed OR not visible, skip POST. Another tab will handle it.
          try {
            localStorage.setItem("auth:last_post_skipped_at", String(Date.now()));
          } catch {}
        }

        return;
      }

      // SIGNED_OUT
      if (event === "SIGNED_OUT") {
        if (!lastSeen) return;

        if (
          lastLogged &&
          lastLogged.user_id === lastSeen &&
          lastLogged.action === "sign_out" &&
          now - lastLogged.ts < DEDUPE_WINDOW_MS
        ) {
          writeLastSeenUser(null);
          return;
        }

        saveLastLogged({ user_id: lastSeen, action: "sign_out", ts: now });
        writeLastSeenUser(null);

        const lastEmail = (() => {
          try {
            return localStorage.getItem(LS_LAST_USER_EMAIL);
          } catch {
            return null;
          }
        })();

        try {
          notifier.send({ type: "sign_out", user_id: lastSeen, user_email: lastEmail, ts: now });
        } catch {}

        const claimKey = "auth:claim_sign_out";
        const payload: Record<string, unknown> = { user_id: lastSeen, user_email: lastEmail, ts: now };

        const shouldAttemptPost = isTabVisible();
        const claimed = tryClaim(claimKey, payload, CLAIM_TTL_MS);

        if (claimed && shouldAttemptPost) {
          try {
            await fetch("/api/log-event", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: lastSeen, user_email: lastEmail, action: "sign_out" }),
            });
          } catch (err) {
            console.error("AuthWatcher: failed to post sign_out", err);
          }
        } else {
          try {
            localStorage.setItem("auth:last_post_skipped_at", String(Date.now()));
          } catch {}
        }

        return;
      }
    });

    // cleanup
    return () => {
      try {
        notifier.close();
      } catch {}
      try {
        sub?.subscription?.unsubscribe?.();
      } catch {}
    };
  }, []);

  return null;
}
