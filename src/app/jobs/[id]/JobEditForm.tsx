"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { JobStatus } from "@/types/database";

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "sealed", label: "Sealed" },
];

interface JobEditFormProps {
  jobId: string;
  initialNotes: string | null;
  initialStatus: JobStatus;
  publicToken: string | null;
}

export function JobEditForm({
  jobId,
  initialNotes,
  initialStatus,
  publicToken,
}: JobEditFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [status, setStatus] = useState<JobStatus>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("jobs")
      .update({ notes: notes.trim() || null, status })
      .eq("id", jobId);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.refresh();
  }

  function handleCopyShareLink() {
    if (!publicToken) return;
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/r/${publicToken}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Edit job</CardTitle>
            <CardDescription>
              Update notes and status. Changes are saved when you click Save.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <label htmlFor="edit-notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Job notes…"
                rows={3}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-status" className="text-sm font-medium">
                Status
              </label>
              <Select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                disabled={saving}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Share link</CardTitle>
          <CardDescription>
            Public link for this job. The public page will be implemented
            later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {publicToken ? (
            <>
              <p className="font-mono text-sm text-muted-foreground">
                /r/{publicToken}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyShareLink}
              >
                {copied ? "Copied" : "Copy full URL"}
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No share token for this job yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
