"use client";
import * as React from "react";
import { Controller, type Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { OnboardingValues } from "@/lib/validation/onboarding";
import { INTERESTS } from "@/lib/validation/onboarding";
import { RequiredAsterisk } from "./Field";

export default function InterestsGrid({
  control,
  error,
}: {
  control: Control<OnboardingValues>;
  error?: string;
}) {
  return (
    <section className="space-y-2">
      <div className="text-sm font-medium">
        Areas of interest <RequiredAsterisk />
      </div>
      <Controller
        control={control}
        name="interests"
        render={({ field }) => {
          const value: string[] = Array.isArray(field.value) ? field.value : [];
          const set = new Set(value);
          return (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INTERESTS.map((i) => {
                  const checked = set.has(i);
                  const cid = `interest-${i}`;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                    >
                      <Checkbox
                        id={cid}
                        checked={checked}
                        onCheckedChange={(v) => {
                          if (v === true) set.add(i);
                          else set.delete(i);
                          field.onChange(Array.from(set));
                        }}
                        aria-required="true"
                      />
                      <Label htmlFor={cid} className="cursor-pointer">
                        {i}
                      </Label>
                    </div>
                  );
                })}
              </div>
              {error ? (
                <p className="text-xs text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
            </>
          );
        }}
      />
    </section>
  );
}
