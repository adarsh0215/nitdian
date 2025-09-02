"use client";
import * as React from "react";
import { Controller, type Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { OnboardingValues } from "@/lib/validation/onboarding";

export default function DirectoryConsents({
  control,
}: {
  control: Control<OnboardingValues>;
}) {
  return (
    <section className="space-y-3">
      <Controller
        control={control}
        name="consent_directory_visible"
        render={({ field }) => (
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent_directory_visible"
              checked={!!field.value}
              onCheckedChange={(v) => field.onChange(!!v)}
            />
            <Label
              htmlFor="consent_directory_visible"
              className="text-sm leading-5 cursor-pointer"
            >
              Show my profile in the Alumni directory and allow organizers to
              contact me.
            </Label>
          </div>
        )}
      />

      <Controller
        control={control}
        name="consent_directory_show_contacts"
        render={({ field }) => (
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent_directory_show_contacts"
              checked={!!field.value}
              onCheckedChange={(v) => field.onChange(!!v)}
            />
            <Label
              htmlFor="consent_directory_show_contacts"
              className="text-sm leading-5 cursor-pointer"
            >
              Show my <b>phone number</b> and <b>email</b> to logged-in members.
            </Label>
          </div>
        )}
      />
    </section>
  );
}
