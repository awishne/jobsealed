import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhotoLightbox } from "@/components/photos/PhotoLightbox";
import type { JobStatus } from "@/types/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BUCKET = "job-photos";
const LOGO_BUCKET = "company-logos";
const SIGNED_URL_EXPIRES_IN = 3600;
const OG_IMAGE_EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days

interface JobRow {
  id: string;
  title: string | null;
  address: string | null;
  notes: string | null;
  status: JobStatus;
  customer_id: string;
  user_id: string;
  created_at: string;
}

interface CustomerRow {
  name: string;
}

interface ProfileRow {
  id: string;
  business_name: string | null;
  logo_url: string | null;
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
  url: string | null;
  caption: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function truncateDescription(text: string | null, maxLength: number = 140): string {
  if (!text) return "Job closeout report with photos and notes.";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, title, notes, created_at, user_id, customer_id, status")
    .eq("public_token", token)
    .single();

  if (jobError || !job) {
    return {
      title: "Job Report | JobSealed",
      description: "Job closeout report with photos and notes.",
    };
  }

  const jobRow = job as unknown as JobRow;

  // Fetch user profile for branding in metadata
  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, business_name, logo_url")
    .eq("id", jobRow.user_id)
    .single();

  const profile = (profileData ?? null) as ProfileRow | null;
  const businessName = profile?.business_name || "JobSealed";

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

  // Pick an "after" photo if available, otherwise first photo
  let selectedPhoto: JobPhotoRow | null = null;
  const afterPhoto = photos.find((p) => p.photo_type === "after");
  if (afterPhoto) {
    selectedPhoto = afterPhoto;
  } else if (photos.length > 0) {
    selectedPhoto = photos[0];
  }

  let ogImageUrl: string | undefined;
  if (selectedPhoto) {
    const bucket = supabase.storage.from(BUCKET);
    const { data: signedData } = await bucket.createSignedUrl(
      selectedPhoto.storage_path,
      OG_IMAGE_EXPIRES_IN
    );
    if (signedData?.signedUrl) {
      ogImageUrl = signedData.signedUrl;
    }
  }

  const title = `${jobRow.title ?? "Untitled job"} — ${customer.name} | ${businessName}`;
  const description = truncateDescription(jobRow.notes);

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(ogImageUrl && { images: [{ url: ogImageUrl }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
  };

  return metadata;
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
    .select("id, title, address, notes, status, customer_id, user_id, created_at")
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
      url: pathToUrl[p.storage_path] || null,
      caption: p.caption,
    }));

  const afterPhotos: ReportPhoto[] = photos
    .filter((p) => p.photo_type === "after")
    .map((p) => ({
      id: p.id,
      url: pathToUrl[p.storage_path] || null,
      caption: p.caption,
    }));

  const safeBefore = beforePhotos.filter((p) => p.url);
  const safeAfter = afterPhotos.filter((p) => p.url);

  // Fetch user profile for branding
  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, business_name, logo_url")
    .eq("id", jobRow.user_id)
    .single();

  const profile = (profileData ?? null) as ProfileRow | null;
  const businessName = profile?.business_name || "JobSealed";

  // Generate signed URL for logo if it exists
  let logoUrl: string | null = null;
  if (profile?.logo_url) {
    const logoBucket = supabase.storage.from(LOGO_BUCKET);
    const { data: logoSignedData } = await logoBucket.createSignedUrl(
      profile.logo_url,
      SIGNED_URL_EXPIRES_IN
    );
    if (logoSignedData?.signedUrl) {
      logoUrl = logoSignedData.signedUrl;
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-6 sm:px-6">
        {/* Brand Bar */}
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${businessName} logo`}
                className="h-14 w-14 md:h-20 md:w-20 shrink-0 rounded-full bg-white shadow-sm object-cover"
              />
            )}
            <h2 className="text-2xl font-semibold leading-tight md:text-3xl">{businessName}</h2>
          </div>
        </div>

        <Card>
          <CardHeader className="gap-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl font-semibold md:text-2xl">
                  {jobRow.title ?? "Untitled job"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {customer.name}
                  {jobRow.address && ` · ${jobRow.address}`}
                </p>
              </div>
              <Badge variant="secondary" className="w-fit shrink-0 capitalize">
                {jobRow.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobRow.notes ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {jobRow.notes}
              </p>
            ) : null}

            {safeBefore.length > 0 ? (
              <section>
                <h3 className="mb-2 text-sm font-semibold">Before</h3>
                <PhotoLightbox
                  images={safeBefore.map((photo) => ({
                    id: photo.id,
                    url: photo.url!,
                    caption: photo.caption,
                  }))}
                />
              </section>
            ) : null}

            {safeAfter.length > 0 ? (
              <section>
                <h3 className="mb-2 text-sm font-semibold">After</h3>
                <PhotoLightbox
                  images={safeAfter.map((photo) => ({
                    id: photo.id,
                    url: photo.url!,
                    caption: photo.caption,
                  }))}
                />
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
