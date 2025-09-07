"use client";
import * as React from "react";
import { Controller, type Control, type FieldPath } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Field from "./Field";
import type { OnboardingValues } from "@/lib/validation/onboarding";

// -------------------------
// SelectEnumField Component
// -------------------------
// A reusable field wrapper around `shadcn/ui` <Select> integrated with react-hook-form.
// Used for enumerated string options like gender, degree, branch, etc.
// Props:
// - control: react-hook-form control instance
// - name: field name from OnboardingValues
// - label: field label text
// - options: list of string options to render
// - placeholder: optional placeholder text
// - required: whether the field is required
// - id: unique id for accessibility
// - error: validation error message (if any)
// -------------------------
export default function SelectEnumField<N extends FieldPath<OnboardingValues>>({
  control,
  name,
  label,
  options,
  placeholder,
  required,
  id,
  error,
}: {
  control: Control<OnboardingValues>;
  name: N;
  label: string;
  options: readonly string[];
  placeholder?: string;
  required?: boolean;
  id: string;
  error?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field label={label} required={required} htmlFor={id} error={error}>
          {/* react-hook-form integration:
              - onValueChange: updates form state
              - value: current value from form (default empty string if undefined) */}
          <Select onValueChange={field.onChange} value={(field.value as string) ?? ""}>
            <SelectTrigger
              id={id}
              aria-required={required ? "true" : undefined}
              className="h-10 w-full rounded-xl text-left"
            >
              <SelectValue
                placeholder={placeholder ?? `Select ${label.toLowerCase()}`}
                className="truncate"
              />
            </SelectTrigger>
            {/* Dropdown list of options */}
            <SelectContent className="max-h-80">
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
    />
  );
}
