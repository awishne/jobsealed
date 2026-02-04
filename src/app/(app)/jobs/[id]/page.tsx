import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobEditForm } from "./JobEditForm";
import { JobPhotoUploader } from "@/components/jobs/JobPhotoUploader";
import { JobPhotoGrid } from "@/components/jobs/JobPhotoGrid";
import { SealJobButton } from "@/components/jobs/SealJobButton";
import { JobPhotoGallery } from "@/components/jobs/JobPhotoGallery";
import type { JobStatus } from "@/types/database";

const BUCKET = "job-photos";
const SIGNED_URL_EXPIRES_IN = 3600;

interface JobPhotoRow {
  id: string;
  job_id: string;
  storage_path: string;
  photo_type: string;
  caption: string | null;
  created_at: string;
}

interface JobRow {
  id: string;
  user_id: string;
  customer_id: string;
  title: string | null;
  address: string | null;
  notes: string | null;
  status: JobStatus;
  public_token: string | null;
  created_at: string;
  updated_at: string;
  customers: { name: string } | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*, customers(name)")
    .eq("id", id)
    .single();

  if (error || !job) {
    redirect("/dashboard");
  }

  const jobRow = job as unknown as JobRow;
  if (jobRow.user_id !== user.id) {
    redirect("/dashboard");
  }

  const customerName = jobRow.customers?.name ?? "Unknown customer";

  const { data: photosData } = await supabase
    .from("job_photos")
    .select("id, storage_path, photo_type, caption, created_at")
    .eq("job_id", id)
    .order("created_at", { ascending: true });

  const photos = (photosData ?? []) as JobPhotoRow[];
  const paths = photos.map((p) => p.storage_path);
  const pathToUrl: Record<string, string> = {};

  if (paths.length > 0) {
    const bucket = supabase.storage.from(BUCKET);
    const { data: signedData } = await bucket.createSignedUrls(
      paths,
      SIGNED_URL_EXPIRES_IN
    );
    if (signedData) {
      for (const item of signedData) {
        if (item.path != null && item.signedUrl) {
          pathToUrl[item.path] = item.signedUrl;
        }
      }
    } else {
      for (const path of paths) {
        const { data: single } = await bucket.createSignedUrl(
          path,
          SIGNED_URL_EXPIRES_IN
        );
        if (single?.signedUrl) pathToUrl[path] = single.signedUrl;
      }
    }
  }

  const beforePhotosWithUrls = photos
    .filter((p) => p.photo_type === "before")
    .map((p) => ({
      id: p.id,
      storage_path: p.storage_path,
      photo_type: p.photo_type as "before" | "after",
      caption: p.caption,
      signedUrl: pathToUrl[p.storage_path] || null,
    }))
    .filter((p) => p.signedUrl !== null);

  const afterPhotosWithUrls = photos
    .filter((p) => p.photo_type === "after")
    .map((p) => ({
      id: p.id,
      storage_path: p.storage_path,
      photo_type: p.photo_type as "before" | "after",
      caption: p.caption,
      signedUrl: pathToUrl[p.storage_path] || null,
    }))
    .filter((p) => p.signedUrl !== null);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">← Dashboard</Link>
          </Button>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Job details
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {customerName} · {jobRow.title || "Untitled job"}
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Customer & job</CardTitle>
          <CardDescription>
            Created {formatDate(jobRow.created_at)} · Updated{" "}
            {formatDate(jobRow.updated_at)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Customer
            </p>
            <p className="font-medium">{customerName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Title</p>
            <p className="font-medium">{jobRow.title || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Address
            </p>
            <p className="font-medium">{jobRow.address || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Status</p>
            <Badge>{jobRow.status}</Badge>
          </div>
          {jobRow.notes && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Notes</p>
              <p className="whitespace-pre-wrap text-sm">{jobRow.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <SealJobButton jobId={jobRow.id} currentStatus={jobRow.status} />

      <JobPhotoUploader jobId={jobRow.id} />

      {beforePhotosWithUrls.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Before</CardTitle>
            <CardDescription>Photos before the job.</CardDescription>
          </CardHeader>
          <CardContent>
            <JobPhotoGallery
              jobId={jobRow.id}
              images={beforePhotosWithUrls.map((p) => ({
                id: p.id,
                url: p.signedUrl!,
                caption: p.caption,
              }))}
            />
          </CardContent>
        </Card>
      )}

      {afterPhotosWithUrls.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>After</CardTitle>
            <CardDescription>Photos after the job.</CardDescription>
          </CardHeader>
          <CardContent>
            <JobPhotoGallery
              jobId={jobRow.id}
              images={afterPhotosWithUrls.map((p) => ({
                id: p.id,
                url: p.signedUrl!,
                caption: p.caption,
              }))}
            />
          </CardContent>
        </Card>
      )}

      <JobEditForm
        jobId={jobRow.id}
        initialNotes={jobRow.notes}
        initialStatus={jobRow.status}
        publicToken={jobRow.public_token}
        shareTitle={
          jobRow.public_token
            ? `${customerName} — ${jobRow.title || "Untitled job"} report`
            : undefined
        }
      />
    </div>
  );
}
