import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "job-photos";

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; photoId: string }>;
  }
) {
  try {
    const { id: jobId, photoId } = await params;
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the job belongs to the user
    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("id, user_id")
      .eq("id", jobId)
      .single();

    if (jobError || !jobData) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (jobData.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify the photo belongs to this job
    const { data: photoData, error: photoError } = await supabase
      .from("job_photos")
      .select("storage_path")
      .eq("id", photoId)
      .eq("job_id", jobId)
      .single();

    if (photoError || !photoData) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    // Use admin client for storage deletion
    const adminClient = createAdminClient();

    // Delete from storage
    const { error: storageError } = await adminClient.storage
      .from(BUCKET)
      .remove([photoData.storage_path]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
      return NextResponse.json(
        { error: "Failed to delete photo from storage" },
        { status: 500 }
      );
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("job_photos")
      .delete()
      .eq("id", photoId);

    if (dbError) {
      console.error("Database deletion error:", dbError);
      return NextResponse.json(
        { error: "Failed to delete photo from database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete photo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
