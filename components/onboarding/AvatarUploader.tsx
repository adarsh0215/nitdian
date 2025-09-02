"use client";

import * as React from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function AvatarUploader({
  userId,
  value,
  onChange,
}: {
  userId: string;
  value?: string | null;
  onChange: (url: string) => void;
}) {
  const sb = React.useMemo(() => supabaseBrowser(), []);
  const [uploading, setUploading] = React.useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `avatars/${userId}.${ext}`;
      const { error } = await sb.storage.from("public").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = sb.storage.from("public").getPublicUrl(path);
      onChange(data.publicUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input type="file" accept="image/*" onChange={handleChange} disabled={uploading} />
      {value ? <span className="text-xs text-muted-foreground truncate">{value}</span> : null}
      <Button type="button" size="sm" disabled>
        {uploading ? "Uploading…" : "Upload"}
      </Button>
    </div>
  );
}
