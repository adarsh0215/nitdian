// components/PendingListClient.tsx
"use client";

/**
 * PendingListClient.tsx
 *
 * - Responsive Directory-style pending profile cards
 * - Built-in small confirm modal (no external dialog lib)
 * - Sonner toast for success/error notifications
 * - Accepts `initialPending?: ProfileItem[]` prop to start with server-provided data
 *
 * Note: If avatars are hosted on external domains, ensure `next.config.js` allows those domains
 * under `images.domains` (or use a proxy). Example:
 *   module.exports = { images: { domains: ["your-cdn.com"] } }
 *
 * Sonner install: npm i sonner
 */

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { toast, Toaster } from "sonner";

/* --------------------------
   Types
   -------------------------- */
type ProfileItem = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null; // legacy field
  avatar_public_url?: string | null; // preferred (public CDN)
  graduation_year?: number | null;
  branch?: string | null;
  degree?: string | null;
  city?: string | null;
  country?: string | null;
  company?: string | null;
  designation?: string | null;
};

/* --------------------------
   Utility: cn
   -------------------------- */
const cn = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

/* --------------------------
   Simple Modal (self-contained)
   - Small, accessible-enough confirm modal
   - No external UI dependencies
   -------------------------- */
function SimpleModal({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  confirmDisabled,
}: {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmDisabled?: boolean;
}) {
  if (!open) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden
      />
      {/* panel */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? <div className="mt-2 text-sm text-slate-700">{description}</div> : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border px-3 py-2 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------
   Avatar: matches Directory style
   - Shows image (next/image) if src provided
   - Otherwise shows initial with subtle gradient
   -------------------------- */
function Avatar({
  name,
  src,
  size = 72,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
}) {
  const initial = (name?.trim()?.[0] || "A").toUpperCase();
  return (
    <div
      className="relative shrink-0 rounded-full ring-2 ring-background overflow-hidden"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? "Avatar"}
          width={size}
          height={size}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center rounded-full bg-gradient-to-br from-teal-500/20 to-indigo-500/20 text-teal-700 font-semibold">
          {initial}
        </div>
      )}
    </div>
  );
}

/* --------------------------
   Helper: convert to initial caps
   -------------------------- */
function toInitCaps(str: string) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* --------------------------
   Main component
   - initialPending prop allows server-side data to be passed in
   -------------------------- */
export default function PendingListClient({ initialPending }: { initialPending?: ProfileItem[] }) {
  // local state of pending profiles (visible to the current approver)
  const [pending, setPending] = useState<ProfileItem[]>(initialPending ?? []);
  // track which profile requests are in-flight
  const [inFlight, setInFlight] = useState<Record<string, boolean>>({});
  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProfile, setModalProfile] = useState<ProfileItem | null>(null);
  const [modalAction, setModalAction] = useState<"APPROVE" | "REJECT" | null>(null);

  // Derived count for heading: shows number of currently visible pending profiles
  const pendingCount = pending.length;

  /* --------------------------
     open confirm dialog (Approve / Reject)
     -------------------------- */
  const openConfirm = (profile: ProfileItem, action: "APPROVE" | "REJECT") => {
    setModalProfile(profile);
    setModalAction(action);
    setModalOpen(true);
  };

  /* --------------------------
     performAction -> POST /api/approve
     - sends same-origin credentials so server-side supabase can read session cookie
     - on success removes profile optimistically from local state
     - displays sonner toast messages
     -------------------------- */
  const performAction = useCallback(async (profileId: string, action: "APPROVE" | "REJECT") => {
    // mark in-flight (disable buttons)
    setInFlight((s) => ({ ...s, [profileId]: true }));

    try {
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin", // important: send cookies for server auth
        body: JSON.stringify({ profileId, action }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        // remove from list (optimistic UI)
        setPending((prev) => prev.filter((p) => p.id !== profileId));

        // different success messages for approve vs reject
        if (action === "APPROVE") {
          toast.success("Profile approved successfully");
        } else {
          toast.success("Profile rejected successfully");
        }
      } else {
        // server returned error (403/401/500 etc.)
        const errMsg = (json && (json.error || json.message)) || `Failed to ${action.toLowerCase()}`;
        toast.error(errMsg);
        console.error("Approve/Reject error:", json);
      }
    } catch (err) {
      console.error("Network/unexpected error:", err);
      toast.error("Network error");
    } finally {
      // clear in-flight
      setInFlight((s) => {
        const copy = { ...s };
        delete copy[profileId];
        return copy;
      });
    }
  }, []);

  /* --------------------------
     Modal confirm handler
     -------------------------- */
  const onModalConfirm = async () => {
    if (!modalProfile || !modalAction) {
      setModalOpen(false);
      setModalProfile(null);
      setModalAction(null);
      return;
    }
    setModalOpen(false);
    await performAction(modalProfile.id, modalAction);
    setModalProfile(null);
    setModalAction(null);
  };

  /* --------------------------
     Empty state
     -------------------------- */
  if (!pending || pending.length === 0) {
    return (
      <div>
        <Toaster position="top-right" richColors />
        <div className="mb-4 text-2xl font-semibold">Pending Approvals</div>
        <div>{pendingCount > 0 && `(${pendingCount})`}</div>
        <div className="rounded-xl border p-6 text-sm text-muted-foreground">No pending profiles to review.</div>
      </div>
    );
  }

  /* --------------------------
     Main render
     - Desktop: Directory list layout with avatar left, content middle, actions on right
     - Mobile: stacked layout; buttons become full-width
     -------------------------- */
  return (
    <div>
      <Toaster position="top-right" richColors />

      
      

      <div className="space-y-4">
        {pending.map((profile) => (
          <article
            key={profile.id}
            className={cn(
              "rounded-2xl border bg-card/50 p-6 shadow-sm hover:shadow transition",
              "flex flex-col sm:flex-row sm:items-start sm:gap-6"
            )}
            aria-label={profile.full_name ?? "Pending profile"}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 mb-4 sm:mb-0">
              <Avatar
                // prefer public CDN field then legacy field
                src={profile.avatar_public_url ?? profile.avatar_url ?? undefined}
                name={profile.full_name ?? undefined}
                size={56}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold leading-6 normal-case">{toInitCaps(profile.full_name ?? "Alumni")}</h3>

              {/* Branch / degree / year block */}
              <div className="mt-2 text-sm text-[#818589] leading-6">
                {profile.branch ? <div className="font-bold text-sm text-slate-700">{profile.branch}</div> : null}
                <div className="mt-2 flex flex-wrap gap-4">
                  {profile.graduation_year ? <div className="text-sm font-bold">{profile.graduation_year}</div> : null}
                  {profile.degree ? <div className="text-sm font-bold">{profile.degree}</div> : null}
                </div>
              </div>

              {/* Location */}
              {(profile.city || profile.country) && (
                <p className="mt-3 text-sm text-slate-600 font-medium">
                  {(profile.city ?? "") + (profile.city && profile.country ? ", " : "") + (profile.country ?? "")}
                </p>
              )}

              {/* Job / Company */}
              {(profile.designation || profile.company) && (
                <div className="mt-3 text-sm text-slate-700">
                  {profile.designation ? <div className="font-semibold">{profile.designation}</div> : null}
                  {profile.company ? <div className="text-slate-600">{profile.company}</div> : null}
                </div>
              )}
            </div>

            {/* Actions column */}
            <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-3">
                <button
                  onClick={() => openConfirm(profile, "APPROVE")}
                  disabled={!!inFlight[profile.id]}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                >
                  Approve
                </button>

                <button
                  onClick={() => openConfirm(profile, "REJECT")}
                  disabled={!!inFlight[profile.id]}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>

              {inFlight[profile.id] && <p className="mt-2 text-xs text-slate-500">Processing…</p>}
            </div>
          </article>
        ))}
      </div>

      {/* Confirm modal - different messages for APPROVE vs REJECT */}
      <SimpleModal
        open={modalOpen}
        title={modalAction === "APPROVE" ? "Confirm Approval" : "Confirm Rejection"}
        description={
          modalProfile ? (
            modalAction === "APPROVE" ? (
              <span>
                Approve only if you are sure that this person is a valid Alumni of{" "}
                <strong>NIT Durgapur</strong>.
                <br />
                <br />
                If you are not sure, seek input from another Alumni before you{" "}
                <strong>Approve</strong>.
                <br />
                <br />
                Profile: <span className="font-semibold">{modalProfile.full_name}</span>
              </span>
            ) : (
              <span>
                Reject only if you are sure that this person is{" "}
                <strong>not a valid Alumni of NIT Durgapur</strong>.
                <br />
                <br />
                Once <strong>Rejected</strong>, this action cannot be undone, and the registrant will{" "}
                <strong>not</strong> be able to apply again with the same email ID.
                <br />
                <br />
                Profile: <span className="font-semibold">{modalProfile.full_name}</span>
              </span>
            )
          ) : (
            "Confirm action"
          )
        }
        confirmLabel={modalAction === "APPROVE" ? "Confirm Approve" : "Confirm Reject"}
        onConfirm={onModalConfirm}
        onCancel={() => {
          setModalOpen(false);
          setModalProfile(null);
          setModalAction(null);
        }}
        confirmDisabled={modalProfile ? !!inFlight[modalProfile.id] : false}
      />
    </div>
  );
}
