"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users } from "lucide-react";

export default function DirectoryWidget({
  count,
  canNavigate,
}: {
  count: number;
  canNavigate: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Alumni directory</CardTitle>
        <Button asChild variant="outline" size="sm" disabled={!canNavigate}>
          <Link href={canNavigate ? "/directory" : "#"}>Open</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border p-4 flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold">{count}</div>
            <div className="text-sm text-muted-foreground">Public, approved profiles</div>
          </div>
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
