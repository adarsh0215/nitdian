// components/profile/ProfileForm.tsx
"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  OnboardingSchema,
  DEGREES,
  BRANCHES,
  EMPLOYMENT_TYPES,
  COUNTRIES,
  type OnboardingValues,
} from "@/lib/validation/onboarding";
import { saveProfile } from "@/actions/profile";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* Reuse onboarding fields (typed to OnboardingValues) */
import Field from "@/components/onboarding/fields/Field";
import AvatarField from "@/components/onboarding/fields/AvatarField";
import PhoneE164Field from "@/components/onboarding/fields/PhoneE164Field";
import SelectEnumField from "@/components/onboarding/fields/SelectEnumField";
import InterestsGrid from "@/components/onboarding/fields/InterestsGrid";
import DirectoryConsents from "@/components/onboarding/fields/DirectoryConsents";

type Result = { ok: false; error: string } | { ok: true } | null;

// ⚠️ Important: keep the RHF value type = OnboardingValues
// so all reused field components' Control<> types match.
type FormValues = OnboardingValues;

export default function ProfileForm({
  userId,
  defaults,
}: {
  userId: string;
  defaults: FormValues; // defaults must include consent_terms_privacy: true
}) {
  const resolver = zodResolver(OnboardingSchema) as unknown as Resolver<FormValues>;

  const form = useForm<FormValues>({
    resolver,
    defaultValues: defaults,
    mode: "onBlur",
  });

  const [state, formAction] = React.useActionState<Result, FormData>(
    async (_prev, formData) => saveProfile(formData),
    null
  );
  const [isPending, startTransition] = React.useTransition();

  const onSubmit = form.handleSubmit((values) => {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (k === "interests" && Array.isArray(v)) v.forEach((i) => fd.append("interests", String(i)));
      else if (typeof v === "boolean") fd.set(k, v ? "true" : "false");
      else if (v != null) fd.set(k, String(v));
    });

    // We don't want the profile save to care about this field:
    fd.delete("consent_terms_privacy");

    startTransition(() => formAction(fd));
  });

  const errors = form.formState.errors;

  // ids for inputs
  const idFullName = React.useId();
  const idEmail = React.useId();
  const idCity = React.useId();
  const idGradYear = React.useId();
  const idRoll = React.useId();
  const idCompany = React.useId();
  const idDesignation = React.useId();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your details. Changes appear in the directory if you’ve consented.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8" noValidate>
          <AvatarField control={form.control} userId={userId} />

          {/* Basic info */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Full name"
              htmlFor={idFullName}
              required
              error={errors.full_name?.message as string | undefined}
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

            {/* Phone */}
            <PhoneE164Field
              control={form.control}
              error={errors.phone_e164?.message as string | undefined}
              idCode={React.useId()}
              idLocal={React.useId()}
            />

            <Field label="City" htmlFor={idCity}>
              <Input
                id={idCity}
                {...form.register("city")}
                placeholder="City"
                autoComplete="address-level2"
              />
            </Field>

            {/* Country */}
            <SelectEnumField
              control={form.control}
              name="country"
              label="Country"
              options={COUNTRIES as unknown as string[]}
              placeholder="Select country"
              id={React.useId()}
              error={undefined}
            />

            <Field
              label="Graduation year"
              htmlFor={idGradYear}
              required
              error={errors.graduation_year?.message as string | undefined}
            >
              <Input
                id={idGradYear}
                {...form.register("graduation_year", {
                  setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
                })}
                inputMode="numeric"
                placeholder="2016"
                aria-required="true"
                aria-invalid={!!errors.graduation_year}
              />
            </Field>

            <SelectEnumField
              control={form.control}
              name="degree"
              label="Degree"
              options={DEGREES as unknown as string[]}
              required
              id={React.useId()}
              error={errors.degree?.message as string | undefined}
            />

            <SelectEnumField
              control={form.control}
              name="branch"
              label="Branch"
              options={BRANCHES as unknown as string[]}
              required
              id={React.useId()}
              error={errors.branch?.message as string | undefined}
            />

            <Field label="Roll number" htmlFor={idRoll}>
              <Input id={idRoll} {...form.register("roll_number")} placeholder="(optional)" />
            </Field>

            <SelectEnumField
              control={form.control}
              name="employment_type"
              label="Employment type"
              options={EMPLOYMENT_TYPES as unknown as string[]}
              id={React.useId()}
              error={undefined}
            />

            <Field label="Company" htmlFor={idCompany}>
              <Input
                id={idCompany}
                {...form.register("company")}
                placeholder="Company"
                autoComplete="organization"
              />
            </Field>

            <Field label="Designation" htmlFor={idDesignation}>
              <Input
                id={idDesignation}
                {...form.register("designation")}
                placeholder="Role / Title"
                autoComplete="organization-title"
              />
            </Field>
          </section>

          <InterestsGrid
            control={form.control}
            error={errors.interests?.message as string | undefined}
          />

          {/* Directory visibility consents */}
          <DirectoryConsents control={form.control} />

          {/* No Terms checkbox on Profile page */}

          {/* Action */}
          {state && "ok" in state && !state.ok && (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}
          <div className="flex items-center justify-end gap-3">
            <Button type="submit" disabled={isPending} aria-busy={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
