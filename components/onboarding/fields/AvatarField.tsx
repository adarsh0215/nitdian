"use client";
import * as React from "react";
import { Controller, type Control } from "react-hook-form";
import { Label } from "@/components/ui/label";
import AvatarUploader from "@/components/onboarding/AvatarUploader";
import type { OnboardingValues } from "@/lib/validation/onboarding";

export default function AvatarField({
  control,
  userId,
}: {
  control: Control<OnboardingValues>;
  userId: string;
}) {
  return (
    <section className="space-y-3">
      <Label className="text-sm font-medium">Avatar</Label>
      <Controller
        control={control}
        name="avatar_url"
        render={({ field }) => (
          <AvatarUploader
            userId={userId}
            value={field.value}
            onChange={(url) => field.onChange(url)}
          />
        )}
      />
    </section>
  );
}
