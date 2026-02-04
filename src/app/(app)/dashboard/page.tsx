import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { JobWithCustomer } from "@/types/database";

const statusVariant: Record<
  JobWithCustomer["status"],
  "secondary" | "default" | "outline" | "destructive"
> = {
  draft: "secondary",
  "in-progress": "default",
  completed: "outline",
  sealed: "default",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }


  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, customers(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const jobList = (jobs ?? []) as JobWithCustomer[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your jobs and sealed reports.
          </p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">New Job</Link>
        </Button>
      </div>

      {jobList.length === 0 ? (
        <Card className="mt-8 p-8 text-center">
          <CardHeader>
            <CardTitle>No jobs yet</CardTitle>
            <CardDescription>
              Create your first job to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/jobs/new">New Job</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {jobList.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {job.customers?.name ?? "Unknown customer"}
                    </CardTitle>
                    <CardDescription>
                      {job.title || "Untitled job"}
                    </CardDescription>
                  </div>
                  <Badge variant={statusVariant[job.status]}>{job.status}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Created {formatDate(job.created_at)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
