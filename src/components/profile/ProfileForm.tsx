"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BUCKET = "company-logos";
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

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
  return mimeMap[file.type] ?? "png";
}

interface ProfileFormProps {
  initialBusinessName: string | null;
  userId: string;
  initialLogoUrl: string | null; // storage path
}

export function ProfileForm({
  initialBusinessName,
  userId,
  initialLogoUrl,
}: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [businessName, setBusinessName] = useState(initialBusinessName ?? "");
  const [savingName, setSavingName] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSaveBusinessName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSavingName(true);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ business_name: businessName.trim() || null })
      .eq("id", userId);

    setSavingName(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess("Company name saved successfully!");
    setTimeout(() => setSuccess(null), 3000);
    router.refresh();
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 1MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadingLogo(true);

    const ext = getExt(file);
    const timestamp = Date.now();
    const storagePath = `${userId}/logo-${timestamp}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setError(uploadError.message);
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Update profile with logo URL (storage path)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ logo_url: storagePath })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadingLogo(false);
    setSuccess("Logo uploaded successfully!");
    setTimeout(() => setSuccess(null), 3000);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSaveBusinessName}>
          <CardHeader>
            <CardTitle>Company Name</CardTitle>
            <CardDescription>
              Your company name will appear on public reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
                {success}
              </p>
            )}
            <div className="space-y-2">
              <label htmlFor="business-name" className="text-sm font-medium">
                Company Name
              </label>
              <Input
                id="business-name"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your company name"
                disabled={savingName}
              />
            </div>
            <Button type="submit" disabled={savingName}>
              {savingName ? "Saving…" : "Save Company Name"}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
          <CardDescription>
            Upload your company logo (PNG recommended, max 1MB). It will appear
            on public reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
              {success}
            </p>
          )}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-hidden
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploadingLogo}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingLogo ? "Uploading…" : "Upload Logo"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
