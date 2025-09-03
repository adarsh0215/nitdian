"use client";

import * as React from "react";
import { Controller, type Control } from "react-hook-form";
import Field from "./Field";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import type { OnboardingValues } from "@/lib/validation/onboarding";

export default function SelectYearField({
  control,
  name = "graduation_year",
  label = "Graduation year",
  required,
  id,
  error,
  startYear,
  endYear,
  descending = true,
}: {
  control: Control<OnboardingValues>;
  name?: "graduation_year";
  label?: string;
  required?: boolean;
  id: string;
  error?: string;
  /** defaults to 1965 .. (current year + 3) */
  startYear?: number;
  endYear?: number;
  /** show newest first (default) */
  descending?: boolean;
}) {
  const now = new Date().getFullYear();
  const min = startYear ?? 1965;
  const max = endYear ?? now + 3;

  const years: number[] = React.useMemo(() => {
    const arr: number[] = [];
    for (let y = min; y <= max; y++) arr.push(y);
    return descending ? arr.reverse() : arr;
  }, [min, max, descending]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field label={label} htmlFor={id} required={required} error={error}>
          <Select
            // form value is number | undefined; Select expects string
            value={field.value ? String(field.value) : ""}
            onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
          >
            <SelectTrigger id={id} className="w-full" aria-required={required} aria-invalid={!!error}>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
    />
  );
}
