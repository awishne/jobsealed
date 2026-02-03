import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { JobStatus } from "@/types/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BUCKET = "job-photos";
const SIGNED_URL_EXPIRES_IN = 3600;

interface JobRow {
  id: string;
  title: string | null;
  address: string | null;
  notes: string | null;
  status: JobStatus;
  customer_id: string;
  created_at: string;
}

interface CustomerRow {
  name: string;
}

interface JobPhotoRow {
  id: string;
  storage_path: string;
  photo_type: string;
  caption: string | null;
  created_at: string;
}

interface ReportPhoto {
  id: string;
  url: string;
  caption: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, title, address, notes, status, customer_id, created_at")
    .eq("public_token", token)
    .single();

  if (jobError || !job) {
    notFound();
  }

  const jobRow = job as unknown as JobRow;

  const { data: customerData } = await supabase
    .from("customers")
    .select("name")
    .eq("id", jobRow.customer_id)
    .single();

  const customer = (customerData ?? { name: "Unknown" }) as CustomerRow;

  const { data: photosData } = await supabase
    .from("job_photos")
    .select("id, storage_path, photo_type, caption, created_at")
    .eq("job_id", jobRow.id)
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

  const beforePhotos: ReportPhoto[] = photos
    .filter((p) => p.photo_type === "before")
    .map((p) => ({
      id: p.id,
      url: pathToUrl[p.storage_path] ?? "",
      caption: p.caption,
    }));

  const afterPhotos: ReportPhoto[] = photos
    .filter((p) => p.photo_type === "after")
    .map((p) => ({
      id: p.id,
      url: pathToUrl[p.storage_path] ?? "",
      caption: p.caption,
    }));

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-6 sm:px-6">
        <Card>
          <CardHeader className="gap-2">
            <p className="text-sm text-muted-foreground">{customer.name}</p>
            <CardTitle className="text-xl">
              {jobRow.title ?? "Untitled job"}
            </CardTitle>
            <Badge variant="secondary" className="w-fit capitalize">
              {jobRow.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobRow.address ? (
              <p className="text-sm">
                <span className="font-medium">Address:</span>{" "}
                {jobRow.address}
              </p>
            ) : null}
            {jobRow.notes ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {jobRow.notes}
              </p>
            ) : null}

            {beforePhotos.length > 0 ? (
              <section>
                <h3 className="mb-2 text-sm font-semibold">Before</h3>
                <div className="grid grid-cols-2 gap-2">
                  {beforePhotos.map((photo) => (
                    <figure key={photo.id} className="space-y-1">
                      <img
                        src={photo.url}
                        alt={photo.caption ?? "Before photo"}
                        className="aspect-square w-full rounded-lg border object-cover"
                      />
                      {photo.caption ? (
                        <figcaption className="text-xs text-muted-foreground">
                          {photo.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}

            {afterPhotos.length > 0 ? (
              <section>
                <h3 className="mb-2 text-sm font-semibold">After</h3>
                <div className="grid grid-cols-2 gap-2">
                  {afterPhotos.map((photo) => (
                    <figure key={photo.id} className="space-y-1">
                      <img
                        src={photo.url}
                        alt={photo.caption ?? "After photo"}
                        className="aspect-square w-full rounded-lg border object-cover"
                      />
                      {photo.caption ? (
                        <figcaption className="text-xs text-muted-foreground">
                          {photo.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Created {formatDate(jobRow.created_at)}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
