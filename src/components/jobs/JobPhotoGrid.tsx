"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BUCKET = "job-photos";

interface Photo {
  id: string;
  storage_path: string;
  photo_type: "before" | "after";
  caption: string | null;
  signedUrl: string | null;
}

interface JobPhotoGridProps {
  jobId: string;
  photos: Photo[];
}

export function JobPhotoGrid({ jobId, photos }: JobPhotoGridProps) {
  const router = useRouter();
  const supabase = createClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  // Filter out photos without signed URLs
  const validPhotos = photos.filter((p) => p.signedUrl);

  if (validPhotos.length === 0) {
    return null;
  }

  async function handleDelete(photo: Photo) {
    setDeletingId(photo.id);
    setError(null);

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([photo.storage_path]);

      if (storageError) {
        setError(storageError.message);
        setDeletingId(null);
        return;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("job_photos")
        .delete()
        .eq("id", photo.id);

      if (dbError) {
        setError(dbError.message);
        setDeletingId(null);
        return;
      }

      // Refresh the page to update the UI
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo");
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {validPhotos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
          >
            <img
              src={photo.signedUrl!}
              alt={photo.caption ?? `${photo.photo_type} photo`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20">
              <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                <AlertDialog
                  open={openDialogId === photo.id}
                  onOpenChange={(open) => {
                    if (!open) {
                      setOpenDialogId(null);
                      setError(null);
                      setDeletingId(null);
                    } else {
                      setOpenDialogId(photo.id);
                      setError(null);
                    }
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-background/90 hover:bg-background"
                      disabled={deletingId === photo.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete photo?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this photo from storage and
                        remove it from the job. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    {error && openDialogId === photo.id && (
                      <p className="text-sm text-destructive" role="alert">
                        {error}
                      </p>
                    )}
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(photo)}
                        disabled={deletingId === photo.id}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deletingId === photo.id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
