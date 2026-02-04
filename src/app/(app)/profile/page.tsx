import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/ProfileForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const BUCKET = "company-logos";
const SIGNED_URL_EXPIRES_IN = 3600;

interface ProfileRow {
  id: string;
  business_name: string | null;
  logo_url: string | null;
  review_url: string | null;
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Fetch profile, create if doesn't exist
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, business_name, logo_url, review_url")
    .eq("id", user.id)
    .single();

  // If profile doesn't exist, create it
  if (profileError && profileError.code === "PGRST116") {
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({ id: user.id })
      .select("id, business_name, logo_url, review_url")
      .single();

    if (insertError || !newProfile) {
      // Handle error - for now just redirect
      redirect("/dashboard");
    }

    const profileRow = newProfile as unknown as ProfileRow;

    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">← Dashboard</Link>
            </Button>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              My Profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Set your company name and logo for public reports.
            </p>
          </div>
        </div>

        <ProfileForm
          initialBusinessName={profileRow.business_name}
          userId={user.id}
          initialLogoUrl={profileRow.logo_url}
          initialReviewUrl={profileRow.review_url}
        />
      </div>
    );
  }

  if (profileError || !profile) {
    redirect("/dashboard");
  }

  const profileRow = profile as unknown as ProfileRow;

  // Generate signed URL for logo preview if it exists
  let logoPreviewUrl: string | null = null;
  if (profileRow.logo_url) {
    const adminSupabase = createAdminClient();
    const bucket = adminSupabase.storage.from(BUCKET);
    const { data: signedData } = await bucket.createSignedUrl(
      profileRow.logo_url,
      SIGNED_URL_EXPIRES_IN
    );
    if (signedData?.signedUrl) {
      logoPreviewUrl = signedData.signedUrl;
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">← Dashboard</Link>
          </Button>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set your company name and logo for public reports.
          </p>
        </div>
      </div>

      {logoPreviewUrl && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Logo</CardTitle>
            <CardDescription>Your current company logo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4">
              <img
                src={logoPreviewUrl}
                alt="Company logo"
                className="max-h-32 max-w-full object-contain"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <ProfileForm
        initialBusinessName={profileRow.business_name}
        userId={user.id}
        initialLogoUrl={profileRow.logo_url}
        initialReviewUrl={profileRow.review_url}
      />
    </div>
  );
}
