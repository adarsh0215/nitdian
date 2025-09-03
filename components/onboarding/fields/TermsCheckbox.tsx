"use client";
import * as React from "react";
import { Controller, type Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RequiredAsterisk } from "./Field";
import type { OnboardingValues } from "@/lib/validation/onboarding";
import Link from "next/link";

export default function TermsCheckbox({
  control,
  error,
}: {
  control: Control<OnboardingValues>;
  error?: string;
}) {
  return (
    <section className="space-y-2">
      <Controller
        control={control}
        name="consent_terms_privacy"
        render={({ field }) => (
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent_terms_privacy"
              checked={!!field.value}
              onCheckedChange={(v) => field.onChange(!!v)}
              aria-required="true"
            />
            <Label
              htmlFor="consent_terms_privacy"
              className="text-sm leading-5 cursor-pointer"
            >
              
              I agree to the{" "}
              <Link
          href="/terms" // ← make sure this route exists
          className="font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[2px]"
        >
          Terms &amp; Conditions
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy" // ← and this one
          className="font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[2px]"
        >
          Privacy Policy
        </Link>
              . <RequiredAsterisk />
            </Label>
          </div>
        )}
      />
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
