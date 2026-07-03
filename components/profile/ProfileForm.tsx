"use client";

/**
 * The one profile form. mode="onboarding" (first-time, requires Terms) vs
 * mode="edit" (prefilled, Terms already accepted). Both server actions
 * redirect to /dashboard on success.
 */

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
  GENDERS,
  INTERESTS,
} from "@/lib/validation/onboarding";
import { COUNTRIES } from "@/lib/countries";
import { saveOnboarding, saveProfile } from "@/actions/profile";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* Field components */
import Field from "@/components/onboarding/fields/Field";
import AvatarField from "@/components/onboarding/fields/AvatarField";
import PhoneE164Field from "@/components/onboarding/fields/PhoneE164Field";
import SelectEnumField from "@/components/onboarding/fields/SelectEnumField";
import InterestsGrid from "@/components/onboarding/fields/InterestsGrid";
import DirectoryConsents from "@/components/onboarding/fields/DirectoryConsents";
import TermsCheckbox from "@/components/onboarding/fields/TermsCheckbox";
import SelectYearField from "@/components/onboarding/fields/SelectYearField";

type ActionResult = Awaited<ReturnType<typeof saveProfile>>;

function isErrResult(r: ActionResult): r is { ok: false; error: string } {
  return !!r && r.ok === false && typeof r.error === "string";
}

export default function ProfileForm({
  mode,
  userEmail,
  userId,
  initial,
}: {
  mode: "onboarding" | "edit";
  userEmail?: string;
  userId: string;
  initial?: Partial<OnboardingValues>;
}) {
  const isOnboarding = mode === "onboarding";
  const resolver = zodResolver(OnboardingSchema) as Resolver<OnboardingValues>;

  const defaultValues = React.useMemo<OnboardingValues>(() => {
    const isAllowedInterest = (
      i: unknown,
    ): i is OnboardingValues["interests"][number] =>
      (INTERESTS as readonly string[]).includes(String(i));

    const base = toFormDefaults(userEmail);
    if (isOnboarding || !initial) return base;

    return {
      ...base,
      gender: (initial.gender ?? undefined) as OnboardingValues["gender"],
      phone_e164: initial.phone_e164 ?? "",
      city: initial.city ?? "",
      country: initial.country ?? "",
      graduation_year: initial.graduation_year ?? undefined,
      degree: (initial.degree ?? undefined) as OnboardingValues["degree"],
      branch: (initial.branch ?? undefined) as OnboardingValues["branch"],
      roll_number: initial.roll_number ?? "",
      employment_type: (initial.employment_type ??
        undefined) as OnboardingValues["employment_type"],
      company: initial.company ?? "",
      designation: initial.designation ?? "",
      avatar_url: initial.avatar_url ?? undefined,
      interests: Array.isArray(initial.interests)
        ? (initial.interests.filter(isAllowedInterest) as OnboardingValues["interests"])
        : ([] as OnboardingValues["interests"]),
      consent_directory_visible: initial.consent_directory_visible ?? false,
      consent_directory_show_contacts:
        initial.consent_directory_show_contacts ?? false,
      email: initial.email ?? base.email,
      full_name: initial.full_name ?? base.full_name,
      consent_terms_privacy: true, // already accepted during onboarding
    };
  }, [userEmail, initial, isOnboarding]);

  const form = useForm<OnboardingValues>({
    resolver,
    defaultValues,
    mode: "onBlur",
  });

  const [state, formAction] = React.useActionState<ActionResult, FormData>(
    isOnboarding ? saveOnboarding : saveProfile,
    null as ActionResult,
  );
  const [isPending, startTransition] = React.useTransition();

  // Focus/scroll to first invalid control on validation error
  React.useEffect(() => {
    const firstInvalid = document.querySelector<HTMLElement>("[aria-invalid='true']");
    firstInvalid?.focus();
    firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [form.formState.errors]);

  const onSubmit = form.handleSubmit((values) => {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (k === "interests" && Array.isArray(v)) {
        v.forEach((i) => fd.append("interests", String(i)));
      } else if (typeof v === "boolean") {
        fd.set(k, v ? "true" : "false");
      } else if (v != null) {
        fd.set(k, String(v));
      }
    });
    startTransition(() => formAction(fd));
  });

  // ids for inputs (a11y)
  const idFullName = React.useId();
  const idEmail = React.useId();
  const idCity = React.useId();
  const idGradYear = React.useId();
  const idRoll = React.useId();
  const idCompany = React.useId();
  const idDesignation = React.useId();
  const idGender = React.useId();

  const errors = form.formState.errors;
  const isSaving = isPending || form.formState.isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isOnboarding ? "Complete your profile" : "Update your profile"}
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          {isOnboarding
            ? "Fill your details to help alumni connect with you."
            : "Keep your details up to date to help alumni connect with you."}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8" noValidate>
          <AvatarField control={form.control} userId={userId} />

          {/* Basic info */}
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

            {/* Gender + Full name */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 min-w-0">
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

            {/* Phone */}
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

            {/* Employment type */}
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

          {/* Interests */}
          <InterestsGrid
            control={form.control}
            error={errors.interests?.message as string | undefined}
          />

          {/* Directory consents */}
          <DirectoryConsents control={form.control} />

          {/* Terms: accepted once, during onboarding */}
          {isOnboarding && (
            <TermsCheckbox
              control={form.control}
              error={errors.consent_terms_privacy?.message as string | undefined}
            />
          )}

          {/* Server action error (auth/RLS/etc.) */}
          {isErrResult(state) && (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button type="submit" disabled={isSaving} aria-busy={isSaving}>
              {isSaving
                ? "Saving..."
                : isOnboarding
                  ? "Save & continue"
                  : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
