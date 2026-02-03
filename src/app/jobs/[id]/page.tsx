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
import type { JobStatus } from "@/types/database";

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

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-12">
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

        <JobEditForm
          jobId={jobRow.id}
          initialNotes={jobRow.notes}
          initialStatus={jobRow.status}
          publicToken={jobRow.public_token}
        />
      </div>
    </main>
  );
}
