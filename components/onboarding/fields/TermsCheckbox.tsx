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
    <section className="space-y-2 col-span-full md:col-span-2">
      <Controller
        control={control}
        name="consent_terms_privacy"
        render={({ field }) => (
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <Checkbox
              id="consent_terms_privacy"
              className="mt-0.5 shrink-0"
              checked={!!field.value}
              onCheckedChange={(v) => field.onChange(!!v)}
              aria-required="true"
              aria-invalid={!!error}
            />

            {/* Label container */}
            <div className="flex-1 min-w-0">
              <Label
                htmlFor="consent_terms_privacy"
                className="text-sm leading-5 cursor-pointer whitespace-normal break-words"
              >
                {/* Non-breaking spaces keep "I agree to the" together */}
                {"I\u00A0agree\u00A0to\u00A0the"}{" "}
                <Link
                  href="/terms"
                  className="font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[2px] whitespace-nowrap"
                >
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[2px] whitespace-nowrap"
                >
                  Privacy Policy
                </Link>
                . <RequiredAsterisk />
              </Label>

              {/* Error message */}
              {error ? (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        )}
      />
    </section>
  );
}
