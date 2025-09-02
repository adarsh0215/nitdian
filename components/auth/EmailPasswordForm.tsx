"use client";

import * as React from "react";
import { signInWithPassword, signUpWithPassword } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useFormStatus } from "react-dom";

// The server actions redirect on success; on failure they return { ok:false, error }.
// That's the only state we render in the form.
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

export default function EmailPasswordForm({
  mode,
  next,
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  const serverAction =
    mode === "login" ? signInWithPassword : signUpWithPassword;

  // Type guard for server action failure shape (no `any` used)
  function isErrorResult(val: unknown): val is { ok: false; error: string } {
    if (typeof val !== "object" || val === null) return false;
    const v = val as Record<string, unknown>;
    return v.ok === false && typeof v.error === "string";
  }

  // Adapter to normalize server action output -> ActionState
  const action = React.useCallback(
    async (_state: ActionState, formData: FormData): Promise<ActionState> => {
      try {
        // ensure `next` is always sent; server decides where to send user
        if (!formData.get("next")) formData.set("next", next ?? "");

        // The server action either redirects (never returns) or returns { ok:false, error }
        const res = await serverAction(null as unknown as never, formData);

        if (isErrorResult(res)) {
          return res; // show the error inline
        }

        // success -> redirect already happened; keep local state empty
        return null;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        return { ok: false, error: message };
      }
    },
    [serverAction, next]
  );

  const [state, formAction] = React.useActionState<ActionState, FormData>(
    action,
    null
  );

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

      {state?.error ? (
        <p id={errId} className="text-sm text-destructive" role="alert" aria-live="polite">
          {state.error}
        </p>
      ) : null}

      <SubmitButton mode={mode} />
    </form>
  );
}
