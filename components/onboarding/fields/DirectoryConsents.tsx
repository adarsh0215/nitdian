"use client";
import * as React from "react";
import { Controller, type Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { OnboardingValues } from "@/lib/validation/onboarding";

// -------------------------
// DirectoryConsents Component
// -------------------------
// Handles two specific consent fields during onboarding:
// 1. Whether to show the user's profile in the Alumni directory.
// 2. Whether to show the user's contact details (phone/email) to members.
//
export default function DirectoryConsents({
  control,
}: {
  control: Control<OnboardingValues>;
}) {
  return (
    <section className="space-y-3">
      {/* -------------------------
          Consent #1: Directory visibility
          -------------------------
          If checked, the user's profile will appear in the Alumni directory
          and organizers will be able to contact them.
      */}
      <Controller
        control={control}
        name="consent_directory_visible"
        render={({ field }) => (
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent_directory_show_contacts"
              checked={true} // always checked
              disabled // user cannot toggle
              onCheckedChange={() => {}} // no-op
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

      {/* -------------------------
          Consent #2: Contact visibility
          -------------------------
          If checked, the user's phone number and email will be visible
          to logged-in members (not just organizers).
      */}
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
