"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";

export function RequiredAsterisk() {
  return <span className="ml-0.5 text-destructive">*</span>;
}

export default function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: React.PropsWithChildren<{
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
}>) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label} {required ? <RequiredAsterisk /> : null}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
