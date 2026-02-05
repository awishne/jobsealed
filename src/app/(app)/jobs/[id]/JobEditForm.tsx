"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ShareReportButtonWrapper } from "@/components/jobs/ShareReportButtonWrapper";
import { VoiceInput } from "@/components/jobs/VoiceInput";
import { Sparkles, Loader2, Undo2 } from "lucide-react";
import type { JobStatus } from "@/types/database";

const POLISH_HINT_KEY = "jobseal_polish_hint_dismissed";

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
  shareTitle?: string;
  jobTitle?: string | null;
  customerName?: string | null;
}

export function JobEditForm({
  jobId,
  initialNotes,
  initialStatus,
  publicToken,
  shareTitle,
  jobTitle,
  customerName,
}: JobEditFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [status, setStatus] = useState<JobStatus>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [polishError, setPolishError] = useState<string | null>(null);
  const [previousNotes, setPreviousNotes] = useState<string | null>(null);
  const [showPolishHint, setShowPolishHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShowPolishHint(localStorage.getItem(POLISH_HINT_KEY) !== "1");
  }, []);

  function dismissPolishHint() {
    if (typeof window === "undefined") return;
    localStorage.setItem(POLISH_HINT_KEY, "1");
    setShowPolishHint(false);
  }

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

  async function handlePolish() {
    const trimmed = notes.trim();
    if (!trimmed || polishing) return;
    setPolishError(null);
    setPreviousNotes(trimmed);
    setPolishing(true);
    try {
      const res = await fetch("/api/polish-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: trimmed,
          ...(jobTitle != null && jobTitle !== "" && { jobTitle }),
          ...(customerName != null && customerName !== "" && { customerName }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPolishError(data.error ?? "Failed to clean up notes");
        setPreviousNotes(null);
        return;
      }
      if (typeof data.text === "string") setNotes(data.text);
    } catch {
      setPolishError("Failed to clean up notes");
      setPreviousNotes(null);
    } finally {
      setPolishing(false);
    }
  }

  function handleUndo() {
    if (previousNotes !== null) {
      setNotes(previousNotes);
      setPreviousNotes(null);
      setPolishError(null);
    }
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
              <div className="relative">
                <Textarea
                  id="edit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Job notes…"
                  rows={3}
                  disabled={saving}
                  className={cn("pr-24 pb-16")}
                />
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full border bg-background/90 px-1 py-1 shadow-sm backdrop-blur">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex shrink-0">
                        <VoiceInput
                          compact
                          onTranscription={(text) => {
                            setNotes((prev) =>
                              prev.trim() ? `${prev.trim()}\n\n${text}` : text
                            );
                          }}
                          disabled={saving || polishing}
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Dictate notes
                    </TooltipContent>
                  </Tooltip>
                  {previousNotes !== null ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-10 w-10 rounded-full text-muted-foreground hover:bg-muted"
                          onClick={handleUndo}
                          disabled={saving}
                        >
                          <Undo2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Undo polish
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Popover
                      open={showPolishHint}
                      onOpenChange={(open) => {
                        if (!open) dismissPolishHint();
                        setShowPolishHint(open);
                      }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="h-10 w-10 rounded-full text-amber-600 hover:bg-amber-50"
                              onClick={handlePolish}
                              disabled={saving || polishing || !notes.trim()}
                            >
                              {polishing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4" />
                              )}
                            </Button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          Make notes customer-ready
                        </TooltipContent>
                      </Tooltip>
                      <PopoverContent align="end" side="top" className="w-72">
                        <PopoverHeader>
                          <PopoverTitle>Make notes customer-ready</PopoverTitle>
                          <PopoverDescription>
                            Fixes spelling/grammar and removes filler. Won&apos;t add new details. Undo anytime.
                          </PopoverDescription>
                        </PopoverHeader>
                        <Button
                          type="button"
                          size="sm"
                          className="mt-2"
                          onClick={dismissPolishHint}
                        >
                          Got it
                        </Button>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
              {polishError && (
                <p className="text-xs text-destructive">{polishError}</p>
              )}
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
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyShareLink}
                >
                  {copied ? "Copied" : "Copy full URL"}
                </Button>
                {shareTitle && (
                  <ShareReportButtonWrapper
                    publicToken={publicToken}
                    title={shareTitle}
                  />
                )}
              </div>
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
