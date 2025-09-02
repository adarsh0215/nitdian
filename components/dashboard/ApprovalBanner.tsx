"use client";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ApprovalBanner({
  isApproved,
  isAdmin,
}: {
  isApproved: boolean;
  isAdmin: boolean;
}) {
  if (isApproved) {
    return (
      <div className="rounded-xl border bg-card p-3 text-sm flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        Your account is approved. Welcome aboard!
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-yellow-300/50 bg-yellow-50 text-yellow-900 p-3 text-sm flex items-center gap-2 dark:bg-yellow-950/30 dark:text-yellow-100">
      <AlertCircle className="h-4 w-4" />
      Your profile is pending approval. Directory and Jobs are locked until approval.
      {isAdmin ? (
        <span className="ml-auto text-xs opacity-80">
          (You’re admin—use Admin → Approvals)
        </span>
      ) : null}
    </div>
  );
}
