"use client";
import * as React from "react";
import { Controller, type Control, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Field from "./Field";
import type { OnboardingValues } from "@/lib/validation/onboarding";
import { COUNTRY_CALLING_CODES } from "@/lib/validation/onboarding";

export default function PhoneE164Field({
  control,
  error,
  idCode,
  idLocal,
}: {
  control: Control<OnboardingValues>;
  error?: string;
  idCode: string;
  idLocal: string;
}) {
  const watched = useWatch({ control, name: "phone_e164" });
  const [phoneCode, setPhoneCode] = React.useState<string>(
    COUNTRY_CALLING_CODES[0].code
  );
  const [phoneLocal, setPhoneLocal] = React.useState<string>("");

  return (
    <Controller
      control={control}
      name="phone_e164"
      render={({ field }) => {
        // Initialize from existing E.164 value
        React.useEffect(() => {
          const raw = field.value as unknown;
          const current = typeof raw === "string" ? raw : "";
          if (current && current.startsWith("+")) {
            const sorted = [...COUNTRY_CALLING_CODES].sort(
              (a, b) => b.code.length - a.code.length
            );
            const match = sorted.find((c) => current.startsWith(c.code));
            if (match) {
              setPhoneCode(match.code);
              setPhoneLocal(current.slice(match.code.length));
            }
          }
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        const update = (code: string, local: string) => {
          const cleaned = local.replace(/[^\d]/g, "");
          // E.164 cap: max 15 digits (no '+')
          const codeDigits = code.replace("+", "").length;
          const maxLocal = Math.max(0, 15 - codeDigits);
          const clipped = cleaned.slice(0, maxLocal);

          setPhoneCode(code);
          setPhoneLocal(clipped);
          field.onChange(clipped ? `${code}${clipped}` : "");
        };

        return (
          <div className="sm:col-span-2">
            <Field label="Phone" required error={error}>
              {/* Mobile: stacked, each with its own border.
                  ≥sm: single unified control with one border + divider. */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[12rem_0_1fr] sm:gap-0 sm:h-10 sm:items-stretch sm:overflow-hidden sm:rounded-xl sm:border  sm:focus-within:border-ring sm:focus-within:ring-2 sm:focus-within:ring-ring">
                {/* Country code */}
                <Select value={phoneCode} onValueChange={(v) => update(v, phoneLocal)}>
                  <SelectTrigger
                    id={idCode}
                    aria-label="Country code"
                    aria-required="true"
                    className="h-10 w-full rounded-xl border bg-background px-3 text-sm shadow-none outline-none focus:ring-2 focus:ring-ring
                               sm:h-full sm:w-auto sm:rounded-none sm:border-0 sm:bg-transparent sm:focus:ring-0 sm:data-[state=open]:bg-muted/40"
                  >
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {COUNTRY_CALLING_CODES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Divider only on ≥sm */}
                <div className="hidden sm:block w-px bg-border" />

                {/* Local number */}
                <Input
                  id={idLocal}
                  value={phoneLocal}
                  onChange={(e) => update(phoneCode, e.target.value)}
                  placeholder="XXXXXXXXXX"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  aria-required="true"
                  aria-invalid={!!error}
                  className="h-10 w-full rounded-xl border bg-background text-sm shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring
                             sm:h-full sm:w-auto sm:flex-1 sm:border-0 sm:rounded-none sm:bg-transparent sm:focus-visible:ring-0"
                />
              </div>

              {error ? (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
            </Field>
          </div>
        );
      }}
    />
  );
}
