"use client";

import * as React from "react";
import { signInWithGoogle } from "@/actions/auth";
import { Loader2 } from "lucide-react";

type GoogleState =
  | { ok: true; url: string }
  | { ok: false; error: string }
  | null;

// Official multicolor Google "G" logo (from brand guidelines)
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 533.5 544.3"
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
  );
}

export default function GoogleButton({ next }: { next?: string }) {
  const action = React.useCallback(
    async (_state: GoogleState, formData: FormData): Promise<GoogleState> => {
      return await signInWithGoogle(null, formData);
    },
    []
  );

  const [state, formAction, pending] = React.useActionState<GoogleState, FormData>(
    action,
    null
  );

  React.useEffect(() => {
    if (state?.ok && state.url) {
      window.location.href = state.url;
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="next" value={next || ""} />

      <button
        type="submit"
        disabled={pending}
        className="mt-3 w-full flex items-center justify-center gap-3 rounded-md border border-[#dadce0] bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-background  dark:bg-card dark:border-border dark:text-foreground transition"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="h-5 w-5" />
        )}
        <span>Continue with Google</span>
      </button>

      {!state?.ok && state?.error ? (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}
