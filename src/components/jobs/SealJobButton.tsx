"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SealJobButtonProps {
  jobId: string;
  currentStatus: string;
}

export function SealJobButton({ jobId, currentStatus }: SealJobButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSealConfirm() {
    setError(null);
    setLoading(true);

    const { error: updateError } = await supabase
      .from("jobs")
      .update({ status: "sealed" })
      .eq("id", jobId);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (currentStatus === "sealed") {
    return (
      <Button variant="outline" disabled className="w-full h-12 text-base">
        ✓ Job Sealed
      </Button>
    );
  }

  return (
    <div className="mb-8 space-y-2">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <Button
          className="w-full h-12 text-base"
          onClick={() => setOpen(true)}
          disabled={loading}
        >
          {loading ? "Sealing…" : "Seal This Job"}
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Seal this job?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the job as sealed for the final report. You can change
              it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleSealConfirm();
              }}
              disabled={loading}
            >
              {loading ? "Sealing…" : "Seal Job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p className="text-sm text-muted-foreground">
        Marks this job as sealed for the final report.
      </p>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
