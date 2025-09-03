"use client";

import * as React from "react";
import { signUpWithPassword } from "@/actions/auth";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

type ActionState = { ok: false; error: string } | null;

/* SubmitButton: allow forcing pending (for client login) while still
   honoring server-action pending for signup mode */
function SubmitButton({
  mode,
  forcePending = false,
}: {
  mode: "login" | "signup";
  forcePending?: boolean;
}) {
  const { pending } = useFormStatus();
  const isPending = forcePending || pending;
  return (
    <Button type="submit" className="w-full" disabled={isPending} aria-disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {mode === "login" ? "Signing in..." : "Creating account..."}
        </>
      ) : (
        <>{mode === "login" ? "Sign in" : "Create account"}</>
      )}
    </Button>
  );
}

/** Robustly detect Next.js redirect errors thrown by `redirect()` */
function isNextRedirect(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === "string") return err.includes("NEXT_REDIRECT");
  const anyErr = err as Record<string, unknown>;
  const digest = typeof anyErr?.digest === "string" ? (anyErr.digest as string) : "";
  const message = typeof anyErr?.message === "string" ? (anyErr.message as string) : "";
  return digest.includes("NEXT_REDIRECT") || message.includes("NEXT_REDIRECT");
}

export default function EmailPasswordForm({
  mode,
  next,
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  // Server action used ONLY for signup now.
  const serverAction = signUpWithPassword;

  function isErrorResult(val: unknown): val is { ok: false; error: string } {
    if (typeof val !== "object" || val === null) return false;
    const v = val as Record<string, unknown>;
    return v.ok === false && typeof v.error === "string";
  }

  // Server action wrapper for SIGNUP mode (unchanged)
  const action = React.useCallback(
    async (_state: ActionState, formData: FormData): Promise<ActionState> => {
      try {
        if (!formData.get("next")) formData.set("next", next ?? "");
        const res = await serverAction(null as unknown as never, formData);
        if (isErrorResult(res)) return res; // show error inline
        return null; // usually unreachable due to redirect()
      } catch (err) {
        if (isNextRedirect(err)) throw err;
        const message = err instanceof Error ? err.message : "Unexpected error";
        return { ok: false, error: message };
      }
    },
    [serverAction, next]
  );

  const [state, formAction] = React.useActionState<ActionState, FormData>(action, null);

  // Client login bits
  const [clientPending, setClientPending] = React.useState(false);
  const [clientError, setClientError] = React.useState<string | null>(null);
  const [revealed, setRevealed] = React.useState(false);
  const emailId = React.useId();
  const pwId = React.useId();
  const errId = React.useId();

  // Single handler supports both modes:
  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    if (mode !== "login") return; // signup handled by server action attribute
    e.preventDefault();
    setClientError(null);
    setClientPending(true);

    try {
      const form = e.currentTarget;
      const email = (form.elements.namedItem("email") as HTMLInputElement)?.value.trim();
      const password = (form.elements.namedItem("password") as HTMLInputElement)?.value;
      const supabase = supabaseBrowser();

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setClientError(error.message || "Sign-in failed.");
        setClientPending(false);
        return;
      }

      const session = data.session;
      if (session) {
        // ensure tokens are ready
        await supabase.auth.getSession();

        // Mirror client session → SERVER cookies so the server navbar sees it instantly
        await fetch("/auth/callback/set", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        });
      }

      // (Optional) make the pill update immediately on this page before navigation
      const meta = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
      const name =
        (typeof meta.full_name === "string" && meta.full_name) ||
        (data.user?.email?.split("@")[0] ?? "Member");
      const avatarUrl = (typeof meta.avatar_url === "string" && meta.avatar_url) || null;
      window.dispatchEvent(
        new CustomEvent("profile:updated", {
          detail: { name, email: data.user?.email ?? "", avatarUrl },
        })
      );

      // 🔥 Hard reload to guarantee server sees cookies on first render (no manual refresh)
      window.location.assign(next ?? "/dashboard");
      // no further code runs after navigation
    } catch (err) {
      setClientError(err instanceof Error ? err.message : "Unexpected error.");
      setClientPending(false);
    }
  };

  return (
    <form
      // Use server action only for SIGNUP; LOGIN handled by onSubmit
      action={mode === "signup" ? formAction : undefined}
      onSubmit={mode === "login" ? onSubmit : undefined}
      className="space-y-4"
      noValidate
    >
      <input type="hidden" name="next" value={next || ""} />

      <div className="space-y-2">
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
          name="email"
          type="email"
          placeholder="you@alumni.com"
          autoComplete="email"
          inputMode="email"
          required
          aria-invalid={!!state?.error || !!clientError}
          aria-describedby={state?.error || clientError ? errId : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={pwId}>Password</Label>
        <div className="relative">
          <Input
            id={pwId}
            name="password"
            type={revealed ? "text" : "password"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={mode === "login" ? "••••••••" : "At least 6 characters"}
            minLength={6}
            required
            className="pr-10"
            aria-invalid={!!state?.error || !!clientError}
            aria-describedby={state?.error || clientError ? errId : undefined}
          />
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-pressed={revealed}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-2 inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition"
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground max-w-sm mx-auto">
        By signing in, you agree to our{" "} <br />
        <Link
          href="/policies/terms"
          className="font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[2px]"
        >
          Terms &amp; Conditions
        </Link>{" "}
        and{" "}
        <Link
          href="/policies/privacy"
          className="font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[2px]"
        >
          Privacy Policy
        </Link>
        .
      </p>

      {state?.error || clientError ? (
        <p id={errId} className="text-sm text-destructive" role="alert" aria-live="polite">
          {clientError || state?.error}
        </p>
      ) : null}

      <SubmitButton mode={mode} forcePending={clientPending} />
    </form>
  );
}
