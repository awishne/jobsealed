"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BUCKET = "job-photos";
const PHOTO_TYPES = ["before", "after"] as const;
type PhotoType = (typeof PHOTO_TYPES)[number];

function getExt(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/i.test(fromName)) return fromName;
  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return mimeMap[file.type] ?? "jpg";
}

export function JobPhotoUploader({ jobId }: { jobId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null, photoType: PhotoType) {
    if (!files?.length) return;
    setError(null);
    setUploading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setError("Not signed in. Please log in and try again.");
      setUploading(false);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = getExt(file);
      const storagePath = `${user.id}/${jobId}/${Date.now()}-${photoType}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        setError(uploadError.message);
        setUploading(false);
        return;
      }

      const { error: insertError } = await supabase.from("job_photos").insert({
        job_id: jobId,
        storage_path: storagePath,
        photo_type: photoType,
      });

      if (insertError) {
        setError(insertError.message);
        setUploading(false);
        return;
      }
    }

    setUploading(false);
    if (beforeInputRef.current) beforeInputRef.current.value = "";
    if (afterInputRef.current) afterInputRef.current.value = "";
    router.refresh();
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <CardDescription>Add before and after photos for this job.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <input
            ref={beforeInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            className="sr-only"
            aria-hidden
            onChange={(e) => handleFiles(e.target.files, "before")}
          />
          <input
            ref={afterInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            className="sr-only"
            aria-hidden
            onChange={(e) => handleFiles(e.target.files, "after")}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => beforeInputRef.current?.click()}
          >
            Add Before Photos
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => afterInputRef.current?.click()}
          >
            Add After Photos
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
