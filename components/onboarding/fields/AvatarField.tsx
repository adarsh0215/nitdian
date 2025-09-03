"use client";

import * as React from "react";
import { Controller, type Control } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import AvatarUploader from "../AvatarUploader"; // relative to ensure correct component
import type { OnboardingValues } from "@/lib/validation/onboarding";

export default function AvatarField({
  control,
  userId,
}: {
  control: Control<OnboardingValues>;
  userId: string;
}) {
  return (
    <section className="space-y-2">
      <div>
        <Label className="text-sm font-medium">Avatar</Label>
        {/* <p className="mt-1 text-xs text-muted-foreground">
          Square image recommended (≥ 512×512). PNG or JPG works best.
        </p> */}
      </div>

      <Controller
        control={control}
        name="avatar_url"
        render={({ field }) => {
          const url = field.value ?? "";
          const hasSrc = typeof url === "string" && url.trim().length > 0;

          return (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {/* Live preview */}
              <Avatar className="h-20 w-20 rounded-full ring-1 ring-black/5 dark:ring-white/10 shadow-sm">
                {hasSrc ? (
                  <AvatarImage src={url} alt="Profile avatar preview" />
                ) : null}
                <AvatarFallback className="text-sm">AL</AvatarFallback>
              </Avatar>

              {/* Uploader & hint */}
              <div className="w-full sm:w-auto space-y-2">
                <AvatarUploader
                  userId={userId}
                  value={hasSrc ? url : null}
                  onChange={(nextUrl: string) => field.onChange(nextUrl)}
                />
                {/* <p className="text-xs text-muted-foreground">
                  Tip: Use a clear headshot with a plain background.
                </p> */}
              </div>
            </div>
          );
        }}
      />
    </section>
  );
}
