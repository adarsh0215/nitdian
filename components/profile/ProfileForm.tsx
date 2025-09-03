// components/profile/ProfileForm.tsx
"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  OnboardingSchema,
  type OnboardingValues,
  DEGREES,
  BRANCHES,
  EMPLOYMENT_TYPES,
  COUNTRIES,
} from "@/lib/validation/onboarding";
import { saveProfile } from "@/actions/profile";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* Reuse your existing field components */
import Field from "@/components/onboarding/fields/Field";
import AvatarField from "@/components/onboarding/fields/AvatarField";
import PhoneE164Field from "@/components/onboarding/fields/PhoneE164Field";
import SelectEnumField from "@/components/onboarding/fields/SelectEnumField";
import InterestsGrid from "@/components/onboarding/fields/InterestsGrid";
import DirectoryConsents from "@/components/onboarding/fields/DirectoryConsents";

type Result = { ok: false; error: string } | null;

export default function ProfileForm({
  userId,
  defaults,
}: {
  userId: string;
  defaults: OnboardingValues;
}) {
  // Keep schema identical to onboarding so all shared fields accept this control.
  const resolver = zodResolver(OnboardingSchema) as Resolver<OnboardingValues>;

  const form = useForm<OnboardingValues>({
    resolver,
    defaultValues: defaults,
    mode: "onBlur",
  });

  const [state, formAction] = React.useActionState<Result, FormData>(
    async (_prev, fd) => saveProfile(null, fd),
    null
  );
  const [isPending, startTransition] = React.useTransition();

  // After a successful save (state === null), notify Navbar to refresh UserPill.
  React.useEffect(() => {
    if (state === null) {
      const values = form.getValues();
      const detail = {
        name: values.full_name,
        email: values.email,
        avatarUrl: values.avatar_url ?? null,
      };
      window.dispatchEvent(new CustomEvent("profile:updated", { detail }));
    }
  }, [state, form]);

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

    // Not shown on Profile page, but the schema includes it; keep it true.
    if (!fd.has("consent_terms_privacy")) fd.set("consent_terms_privacy", "true");

    // Dispatch the server action; do NOT check the (void) return of formAction.
    startTransition(() => formAction(fd));
  });

  const errors = form.formState.errors;

  // ids for simple text inputs
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
        <CardTitle>Edit profile</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your information up to date so other alumni can connect with you.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8" noValidate>
          <AvatarField control={form.control} userId={userId} />

          {/* Basic info */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <Field label="Roll number ( at REC/NIT Durgapur )" htmlFor={idRoll}>
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

          <DirectoryConsents control={form.control} />

          {/* Action */}
          {state?.error && (
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
