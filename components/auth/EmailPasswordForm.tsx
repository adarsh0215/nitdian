"use client";

import * as React from "react";
import {
  signInWithPassword,
  signUpWithPassword,
  type AuthActionState,
} from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

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
  const [state, formAction] = React.useActionState<AuthActionState, FormData>(
    mode === "login" ? signInWithPassword : signUpWithPassword,
    null
  );
  const [revealed, setRevealed] = React.useState(false);
  const emailId = React.useId();
  const pwId = React.useId();
  const errId = React.useId();

  const error = state && !state.ok ? state.error : null;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next || ""} />

      <div className="space-y-2">
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
          name="email"
          type="email"
          placeholder="enter your email"
          autoComplete="email"
          inputMode="email"
          required
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
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
            aria-invalid={!!error}
            aria-describedby={error ? errId : undefined}
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

      {error ? (
        <p id={errId} className="text-sm text-destructive" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {state.message}
        </p>
      ) : null}

      <SubmitButton mode={mode} />
    </form>
  );
}
