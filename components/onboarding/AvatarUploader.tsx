"use client";

import * as React from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, Trash2 } from "lucide-react";

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
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const ACCEPT = ["image/png", "image/jpeg", "image/webp"];
  const MAX_BYTES = 5 * 1024 * 1024; // 5MB

  const chooseFile = () => inputRef.current?.click();

  function parseStorageKeyFromPublicUrl(url: string) {
    try {
      const u = new URL(url);
      // Expected: /storage/v1/object/public/<bucket>/<path...>
      const prefix = "/storage/v1/object/public/";
      const idx = u.pathname.indexOf(prefix);
      if (idx === -1) return null;
      const rest = u.pathname.slice(idx + prefix.length); // "<bucket>/<path...>"
      const [bucket, ...pathParts] = rest.split("/");
      const name = pathParts.join("/");
      if (!bucket || !name) return null;
      return { bucket, name };
    } catch {
      return null;
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // allow re-picking the same file later
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;

    setError(null);

    if (!ACCEPT.includes(file.type)) {
      setError("Please select a PNG, JPG, or WEBP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image is too large. Max 5MB.");
      return;
    }

    setUploading(true);
    try {
      const ext =
        file.type === "image/png" ? "png" :
        file.type === "image/webp" ? "webp" : "jpg";

      const path = `avatars/${userId}.${ext}`;
      const { error: upErr } = await sb.storage
        .from("public")
        .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });

      if (upErr) throw upErr;

      const { data } = sb.storage.from("public").getPublicUrl(path);
      const nextUrl = `${data.publicUrl}?t=${Date.now()}`; // bust cache
      onChange(nextUrl);
    } catch (err: any) {
      setError(err?.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClear = async () => {
    if (!value) {
      onChange("");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const parsed = parseStorageKeyFromPublicUrl(value);
      // Only delete if it is our bucket AND matches this user's avatar naming scheme
      if (parsed?.bucket === "public" && parsed.name.startsWith(`avatars/${userId}.`)) {
        await sb.storage.from("public").remove([parsed.name]);
      }
      onChange(""); // clear from form either way
      if (inputRef.current) inputRef.current.value = "";
    } catch (err: any) {
      // If delete fails (e.g., URL not ours), still clear the field
      onChange("");
      setError(err?.message ?? "Could not remove from storage, cleared locally.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {/* hidden native input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        onChange={handleChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="sm"
          onClick={chooseFile}
          disabled={uploading}
          aria-busy={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              {value ? "Change photo" : "Upload photo"}
            </>
          )}
        </Button>

        {value ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleClear}
            disabled={uploading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        ) : null}

        <div className="text-xs text-muted-foreground truncate max-w-full sm:max-w-xs">
          {value ? "Image selected" : "No image uploaded"}
        </div>

        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-xs underline text-muted-foreground"
          >
            Preview
          </a>
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <p className="text-muted-foreground">PNG, JPG or WEBP • Max 5MB • Square works best</p>
        {uploading ? <span className="text-muted-foreground">Please wait…</span> : null}
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
