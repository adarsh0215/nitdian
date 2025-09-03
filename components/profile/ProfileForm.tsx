"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
  INTERESTS,
} from "@/lib/validation/onboarding";
import { saveProfile } from "@/actions/profile";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* Reused field components (from onboarding) */
import Field from "@/components/onboarding/fields/Field";
import AvatarField from "@/components/onboarding/fields/AvatarField";
import PhoneE164Field from "@/components/onboarding/fields/PhoneE164Field";
import SelectEnumField from "@/components/onboarding/fields/SelectEnumField";
import InterestsGrid from "@/components/onboarding/fields/InterestsGrid";
import DirectoryConsents from "@/components/onboarding/fields/DirectoryConsents";
import SelectYearField from "@/components/onboarding/fields/SelectYearField";

// Derive the action result and add type guards to avoid `any`
type ActionResult = Awaited<ReturnType<typeof saveProfile>>;
type OkResult = Extract<NonNullable<ActionResult>, { ok: true }>;
type ErrResult = Extract<NonNullable<ActionResult>, { ok: false; error: string }>;

function isOkResult(r: ActionResult): r is OkResult {
  return !!r && typeof (r as { ok?: boolean }).ok === "boolean" && (r as { ok: boolean }).ok === true;
}
function isErrResult(r: ActionResult): r is ErrResult {
  return !!r && typeof (r as { ok?: boolean }).ok === "boolean" && (r as { ok: boolean }).ok === false;
}

export default function ProfileForm({
  userEmail,
  userId,
  initial,
}: {
  userEmail?: string;
  userId: string;
  initial?: Partial<OnboardingValues>;
}) {
  const router = useRouter();
  const resolver = zodResolver(OnboardingSchema) as Resolver<OnboardingValues>;

  // Type guard to narrow interests to the allowed literals
  const isAllowedInterest = (
    i: unknown
  ): i is OnboardingValues["interests"][number] =>
    (INTERESTS as readonly string[]).includes(String(i));

  const defaultValues = React.useMemo<OnboardingValues>(() => {
    const base = toFormDefaults(userEmail);

    const clean = (val: Partial<OnboardingValues> | undefined): Partial<OnboardingValues> =>
      !val
        ? {}
        : {
            gender: (val.gender ?? undefined) as OnboardingValues["gender"],
            phone_e164: val.phone_e164 ?? "",
            city: val.city ?? "",
            country: val.country ?? "",
            graduation_year: val.graduation_year ?? undefined,
            degree: (val.degree ?? undefined) as OnboardingValues["degree"],
            branch: (val.branch ?? undefined) as OnboardingValues["branch"],
            roll_number: val.roll_number ?? "",
            employment_type: (val.employment_type ??
              undefined) as OnboardingValues["employment_type"],
            company: val.company ?? "",
            designation: val.designation ?? "",
            avatar_url: val.avatar_url ?? undefined,
            interests: Array.isArray(val.interests)
              ? (val.interests.filter(isAllowedInterest) as OnboardingValues["interests"])
              : ([] as OnboardingValues["interests"]),
            consent_directory_visible: val.consent_directory_visible ?? false,
            consent_directory_show_contacts: val.consent_directory_show_contacts ?? false,
          };

    return {
      ...base,
      ...clean(initial),
      email: initial?.email ?? base.email,
      full_name: initial?.full_name ?? base.full_name,
      consent_terms_privacy: true, // always true for profile edits
    };
  }, [userEmail, initial]);

  const form = useForm<OnboardingValues>({
    resolver,
    defaultValues,
    mode: "onBlur",
  });

  const [state, formAction] = React.useActionState<ActionResult, FormData>(
    saveProfile,
    null as ActionResult
  );
  const [isPending, startTransition] = React.useTransition();

  // Redirect to dashboard after successful save
  React.useEffect(() => {
    if (isOkResult(state)) {
      router.push("/dashboard");
    }
  }, [state, router]);

  // Focus/scroll to first invalid control on validation error
  React.useEffect(() => {
    if (!form.formState.errors) return;
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
    // For profile edits, schema accepts optional; we keep it true for consistency.
    fd.set("consent_terms_privacy", "true");

    startTransition(() => formAction(fd));
  });

  // ids for inputs
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
        <CardTitle>Update your profile</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your details up to date to help alumni connect with you.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8" noValidate>
          <AvatarField control={form.control} userId={userId} />

          {/* Basic info */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 min-w-0">
            {/* Email */}
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

            {/* Branch + Roll */}
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

          {/* Server action error */}
          {isErrResult(state) && (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button type="submit" disabled={isSaving} aria-busy={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
