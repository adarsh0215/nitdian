"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  OnboardingSchema,
  type OnboardingValues,
  toFormDefaults,
  DEGREES,
  BRANCHES,
  EMPLOYMENT_TYPES,
  COUNTRIES,
  GENDERS,
} from "@/lib/validation/onboarding";
import { saveOnboarding } from "@/actions/profile";

/* shadcn/ui components for form layout and styling */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* Local reusable field components for consistency */
import Field from "./fields/Field";
import AvatarField from "./fields/AvatarField";
import PhoneE164Field from "./fields/PhoneE164Field";
import SelectEnumField from "./fields/SelectEnumField";
import InterestsGrid from "./fields/InterestsGrid";
import DirectoryConsents from "./fields/DirectoryConsents";
import TermsCheckbox from "./fields/TermsCheckbox";
import SelectYearField from "./fields/SelectYearField";

// Derive the server action result type to ensure correctness
type ActionResult = Awaited<ReturnType<typeof saveOnboarding>>;
// Specific error result shape
type ErrResult = Extract<NonNullable<ActionResult>, { ok: false; error: string }>;

// Type guard to identify if action result is an error
function isErrResult(r: ActionResult): r is ErrResult {
  if (r == null || typeof r !== "object") return false;
  const rec = r as { ok?: unknown; error?: unknown };
  return rec.ok === false && typeof rec.error === "string";
}

export default function OnboardingForm({
  userEmail,
  userId,
}: {
  userEmail?: string;
  userId: string;
}) {
  // Hook-form setup with Zod validation schema
  const resolver = zodResolver(OnboardingSchema) as Resolver<OnboardingValues>;

  const form = useForm<OnboardingValues>({
    resolver,
    defaultValues: toFormDefaults(userEmail),
    mode: "onBlur", // validate on blur for better UX
  });

  // Server action binding for onboarding save
  const [state, formAction] = React.useActionState<ActionResult, FormData>(
    saveOnboarding,
    null as ActionResult
  );
  // Transition state for disabling UI while saving
  const [isPending, startTransition] = React.useTransition();

  // Focus/scroll to first invalid control on validation error
  React.useEffect(() => {
    const firstInvalid = document.querySelector<HTMLElement>("[aria-invalid='true']");
    firstInvalid?.focus();
    firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [form.formState.errors]);

  // Convert form values into FormData for server action
  const onSubmit = form.handleSubmit((values) => {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (k === "interests" && Array.isArray(v)) {
        v.forEach((i) => fd.append("interests", String(i))); // multiple entries
      } else if (typeof v === "boolean") {
        fd.set(k, v ? "true" : "false");
      } else if (v != null) {
        fd.set(k, String(v));
      }
    });
    startTransition(() => formAction(fd));
  });

  // Stable ids for input labels (a11y support)
  const idFullName = React.useId();
  const idEmail = React.useId();
  const idCity = React.useId();
  const idGradYear = React.useId();
  const idRoll = React.useId();
  const idCompany = React.useId();
  const idDesignation = React.useId();
  const idGender = React.useId();

  const errors = form.formState.errors;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete your profile</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill your details to help alumni connect with you.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8" noValidate>
          {/* Profile picture upload */}
          <AvatarField control={form.control} userId={userId} />

          {/* Basic info section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 min-w-0">
            {/* Email (readonly, non-editable) */}
            <div className="sm:col-span-2 min-w-0">
              <Field label="Email" htmlFor={idEmail} required>
                <Input
                  id={idEmail}
                  {...form.register("email")}
                  type="email"
                  readOnly
                  disabled
                  autoComplete="email"
                  aria-required="true"
                />
                <p className="text-xs text-muted-foreground">
                  Email is tied to your account and can’t be changed here.
                </p>
              </Field>
            </div>

            {/* Gender (small) + Full name (wide) */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 min-w-0">
              {/* Gender select */}
              <div className="min-w-0">
                <SelectEnumField
                  control={form.control}
                  name="gender"
                  label="Gender"
                  options={GENDERS as unknown as string[]}
                  placeholder="Select gender"
                  id={idGender}
                  error={undefined}
                />
              </div>
              {/* Full name input */}
              <div className="sm:col-span-2 min-w-0">
                <Field
                  label="Full name ( As it appears in college records )"
                  htmlFor={idFullName}
                  required
                  error={errors.full_name?.message}
                >
                  <Input
                    id={idFullName}
                    {...form.register("full_name")}
                    placeholder="Your full name"
                    autoComplete="name"
                    aria-required="true"
                    aria-invalid={!!errors.full_name}
                  />
                </Field>
              </div>
            </div>

            {/* Phone number (split into code + number) */}
            <PhoneE164Field
              control={form.control}
              error={errors.phone_e164?.message as string | undefined}
              idCode={React.useId()}
              idLocal={React.useId()}
            />

            {/* City + Country */}
            <div className="min-w-0">
              <Field label="City" htmlFor={idCity}>
                <Input
                  id={idCity}
                  {...form.register("city")}
                  placeholder="City"
                  autoComplete="address-level2"
                />
              </Field>
            </div>
            <div className="min-w-0">
              <SelectEnumField
                control={form.control}
                name="country"
                label="Country"
                options={COUNTRIES as unknown as string[]}
                placeholder="Select country"
                id={React.useId()}
                error={undefined}
              />
            </div>

            {/* Graduation year + Degree */}
            <div className="min-w-0">
              <SelectYearField
                control={form.control}
                id={idGradYear}
                required
                error={errors.graduation_year?.message as string | undefined}
              />
            </div>
            <div className="min-w-0">
              <SelectEnumField
                control={form.control}
                name="degree"
                label="Degree"
                options={DEGREES as unknown as string[]}
                required
                id={React.useId()}
                error={errors.degree?.message as string | undefined}
              />
            </div>

            {/* Branch + Roll number */}
            <div className="min-w-0">
              <SelectEnumField
                control={form.control}
                name="branch"
                label="Branch"
                options={BRANCHES as unknown as string[]}
                required
                id={React.useId()}
                error={errors.branch?.message as string | undefined}
              />
            </div>
            <div className="min-w-0">
              <Field label="Roll Number ( at REC/NIT Durgapur )" htmlFor={idRoll}>
                <Input
                  id={idRoll}
                  {...form.register("roll_number")}
                  placeholder="(Valid Roll Number)"
                />
              </Field>
            </div>

            {/* Employment type (single full-width select) */}
            <div className="sm:col-span-2 min-w-0">
              <SelectEnumField
                control={form.control}
                name="employment_type"
                label="Employment type"
                options={EMPLOYMENT_TYPES as unknown as string[]}
                id={React.useId()}
                error={undefined}
              />
            </div>

            {/* Company + Designation */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 min-w-0">
              <div className="min-w-0">
                <Field label="Company" htmlFor={idCompany}>
                  <Input
                    id={idCompany}
                    {...form.register("company")}
                    placeholder="Company"
                    autoComplete="organization"
                  />
                </Field>
              </div>
              <div className="min-w-0">
                <Field label="Designation" htmlFor={idDesignation}>
                  <Input
                    id={idDesignation}
                    {...form.register("designation")}
                    placeholder="Role / Title"
                    autoComplete="organization-title"
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Interests grid (multiple selectable options) */}
          <InterestsGrid
            control={form.control}
            error={errors.interests?.message as string | undefined}
          />

          {/* Directory sharing preferences */}
          <DirectoryConsents control={form.control} />

          {/* Terms and privacy consent checkbox */}
          <TermsCheckbox
            control={form.control}
            error={errors.consent_terms_privacy?.message as string | undefined}
          />

          {/* Server action error (auth/RLS/etc.) */}
          {isErrResult(state) && (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}

          {/* Submit button aligned to the right */}
          <div className="flex items-center justify-end gap-3">
            <Button type="submit" disabled={isPending} aria-busy={isPending}>
              {isPending ? "Saving..." : "Save & continue"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
