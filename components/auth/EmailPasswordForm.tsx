"use client";

import * as React from "react";
import { signInWithPassword, signUpWithPassword } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

type ActionState = { ok: false; error: string } | null;

function SubmitButton({ mode }: { mode: "login" | "signup" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} aria-disabled={pending}>
      {pending ? (
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

  // string case
  if (typeof err === "string") return err.includes("NEXT_REDIRECT");

  // object-ish cases
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
  const serverAction = mode === "login" ? signInWithPassword : signUpWithPassword;

  function isErrorResult(val: unknown): val is { ok: false; error: string } {
    if (typeof val !== "object" || val === null) return false;
    const v = val as Record<string, unknown>;
    return v.ok === false && typeof v.error === "string";
  }

  const action = React.useCallback(
    async (_state: ActionState, formData: FormData): Promise<ActionState> => {
      try {
        if (!formData.get("next")) formData.set("next", next ?? "");
        const res = await serverAction(null as unknown as never, formData);

        // If the action returned an error payload, show it.
        if (isErrorResult(res)) return res;

        // Success paths usually never return because `redirect()` is thrown.
        return null;
      } catch (err) {
        // 🔑 Let Next.js complete its redirect instead of rendering the message.
        if (isNextRedirect(err)) throw err;

        const message = err instanceof Error ? err.message : "Unexpected error";
        return { ok: false, error: message };
      }
    },
    [serverAction, next]
  );

  const [state, formAction] = React.useActionState<ActionState, FormData>(action, null);

  const [revealed, setRevealed] = React.useState(false);
  const emailId = React.useId();
  const pwId = React.useId();
  const errId = React.useId();

  return (
    <form action={formAction} className="space-y-4" noValidate>
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
          aria-invalid={!!state?.error}
          aria-describedby={state?.error ? errId : undefined}
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
            aria-invalid={!!state?.error}
            aria-describedby={state?.error ? errId : undefined}
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
        By signing in, you agree to our{" "}
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

      {state?.error ? (
        <p id={errId} className="text-sm text-destructive" role="alert" aria-live="polite">
          {state.error}
        </p>
      ) : null}

      <SubmitButton mode={mode} />
    </form>
  );
}
