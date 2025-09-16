// components/PendingProfileCard.tsx
"use client";

import React from "react";
import Image from "next/image";

type PendingProfile = {
  id: string;
  full_name?: string | null;
  graduation_year?: string | number | null;
  branch?: string | null;
  avatar_url?: string | null;
  degree?: string | null;
  designation?: string | null;
  company?: string | null;
  city?: string | null;
  country?: string | null;
};

export default function PendingProfileCard({
  profile,
  onAction,
  disabled = false,
}: {
  profile: PendingProfile;
  onAction: (profileId: string, action: "APPROVE" | "REJECT") => void;
  disabled?: boolean;
}) {
  const name = (profile.full_name ?? "Alumni") as string;
  const grad = profile.graduation_year ?? "";
  const branch = profile.branch ?? "";
  const degree = profile.degree ?? "";
  const designation = profile.designation ?? "";
  const company = profile.company ?? "";
  const avatar = profile.avatar_url ?? null;
  const location =
    profile.city && profile.country
      ? `${profile.city}, ${profile.country}`
      : profile.city || profile.country || "";

  // Simple initial for fallback avatar
  const initial = (String(name).trim()?.[0] || "A").toUpperCase();

  return (
    <article className="rounded-2xl border bg-card/50 p-5 shadow-sm hover:shadow transition">
      <div className="flex gap-4 items-start">
        {/* Avatar */}
        <div
          className="relative shrink-0 rounded-full ring-2 ring-background overflow-hidden"
          style={{ width: 56, height: 56 }}
          aria-hidden
        >
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={56}
              height={56}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center rounded-full bg-gradient-to-br from-teal-500/20 to-indigo-500/20 text-teal-700 font-semibold">
              {initial}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="text-lg font-semibold leading-6 normal-case">{name}</h3>

          {/* Year / Branch / Degree */}
          <div className="mt-2 text-sm text-[#818589]">
            <div>
              <span className="font-bold">Year:</span>{" "}
              <span className="ml-1">{grad || "—"}</span>
            </div>
            <div className="mt-1">
              <span className="font-bold">Branch:</span>{" "}
              <span className="ml-1">{branch || "—"}</span>
            </div>
            {degree ? (
              <div className="mt-1">
                <span className="font-bold">Degree:</span>{" "}
                <span className="ml-1">{degree}</span>
              </div>
            ) : null}
          </div>

          {/* Location */}
          {location ? (
            <p className="mt-3 text-sm text-[#818589] font-bold">{location}</p>
          ) : null}

          {/* Headline (designation @ company) */}
          {designation || company ? (
            <div className="mt-2 text-[15px] leading-6 text-[#608286] font-bold">
              {designation ? (
                <div>
                  {designation}
                  {company ? ` @ ${company}` : ""}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-3">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:brightness-95 disabled:opacity-60"
          onClick={() => onAction(profile.id, "APPROVE")}
          disabled={disabled}
        >
          Approve
        </button>

        <button
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:brightness-95 disabled:opacity-60"
          onClick={() => onAction(profile.id, "REJECT")}
          disabled={disabled}
        >
          Reject
        </button>
      </div>
    </article>
  );
}
