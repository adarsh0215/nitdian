"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit3, Users, Briefcase, Shield } from "lucide-react";

export default function QuickActions({
  isApproved,
  isAdmin,
}: {
  isApproved: boolean;
  isAdmin: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button asChild variant="outline">
        <Link href="/onboarding">
          <Edit3 className="mr-2 h-4 w-4" />
          Edit profile
        </Link>
      </Button>

      <Button asChild variant={isApproved ? "default" : "secondary"} disabled={!isApproved}>
        <Link href={isApproved ? "/jobs/new" : "#"}>
          <Plus className="mr-2 h-4 w-4" />
          Post a job
        </Link>
      </Button>

      <Button asChild variant={isApproved ? "outline" : "secondary"} disabled={!isApproved}>
        <Link href={isApproved ? "/directory" : "#"}>
          <Users className="mr-2 h-4 w-4" />
          Directory
        </Link>
      </Button>

      {isAdmin ? (
        <Button asChild variant="outline">
          <Link href="/admin/approvals">
            <Shield className="mr-2 h-4 w-4" />
            Admin: Approvals
          </Link>
        </Button>
      ) : (
        <Button asChild variant="outline">
          <Link href="/jobs">
            <Briefcase className="mr-2 h-4 w-4" />
            Browse jobs
          </Link>
        </Button>
      )}
    </div>
  );
}
