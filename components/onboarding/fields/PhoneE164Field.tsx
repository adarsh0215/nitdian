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
  // ✅ Watch the raw value at top-level (allowed)
  const raw = useWatch({ control, name: "phone_e164" });

  const [phoneCode, setPhoneCode] = React.useState<string>(COUNTRY_CALLING_CODES[0].code);
  const [phoneLocal, setPhoneLocal] = React.useState<string>("");

  React.useEffect(() => {
    const current = typeof raw === "string" ? raw : "";
    if (current.startsWith("+")) {
      const sorted = [...COUNTRY_CALLING_CODES].sort((a, b) => b.code.length - a.code.length);
      const match = sorted.find((c) => current.startsWith(c.code));
      const cc = match?.code ?? COUNTRY_CALLING_CODES[0].code;
      setPhoneCode(cc);
      setPhoneLocal(current.slice(cc.length));
    } else {
      setPhoneLocal(current.replace(/[^\d]/g, ""));
    }
  }, [raw]);

  const update = (onChange: (v: string) => void, code: string, local: string) => {
    const cleaned = local.replace(/[^\d]/g, "");
    setPhoneCode(code);
    setPhoneLocal(cleaned);
    onChange(cleaned ? `${code}${cleaned}` : "");
  };

  return (
    <Controller
      control={control}
      name="phone_e164"
      render={({ field }) => (
        <div className="sm:col-span-2">
          <Field label="Phone" required error={error}>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Select value={phoneCode} onValueChange={(v) => update(field.onChange, v, phoneLocal)}>
                  <SelectTrigger id={idCode} aria-label="Country code" aria-required="true">
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
              </div>
              <div className="col-span-2">
                <Input
                  id={idLocal}
                  value={phoneLocal}
                  onChange={(e) => update(field.onChange, phoneCode, e.target.value)}
                  placeholder="XXXXXXXXXX"
                  inputMode="tel"
                  autoComplete="tel"
                  aria-required="true"
                  aria-invalid={!!error}
                />
              </div>
            </div>
            {error ? (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {error}
              </p>
            ) : null}
          </Field>
        </div>
      )}
    />
  );
}
