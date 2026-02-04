import { LogoutButton } from "@/components/auth/LogoutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Camera, FileCheck, Share2 } from "lucide-react";
import Link from "next/link";

const DEMO = process.env.NEXT_PUBLIC_DEMO_REPORT_TOKEN;

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="font-semibold tracking-tight">
            JobSealed
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/profile">Profile</Link>
                </Button>
                <LogoutButton />
              </>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6">
        {/* Hero */}
        <section className="py-10 sm:py-14">
          <div className="flex flex-col items-start gap-5">
            <Badge variant="secondary">Job Closeout for Trades</Badge>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              <span className="js-word-left">Job</span><span className="js-word-right">Sealed</span>
            </h1>

            <p className="max-w-2xl text-lg text-muted-foreground">
              Create a clean before/after closeout report in minutes—photos,
              notes, and a shareable link your customer can&apos;t ignore.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/dashboard">Start a new job</Link>
              </Button>
              {DEMO ? (
                <Button asChild size="lg" variant="outline">
                  <Link href={`/r/${DEMO}`}>
                    See an example report
                  </Link>
                </Button>
              ) : (
                <div className="flex flex-col gap-1">
                  <Button size="lg" variant="outline" disabled>
                    See an example report
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Demo report coming soon
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="py-10">
          <h2 className="sr-only">Features</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="p-6">
              <CardHeader className="p-0">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Camera className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Before / After</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <CardDescription>
                  Snap photos on-site and organize them instantly.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardHeader className="p-0">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Professional Closeout</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <CardDescription>
                  Notes and a signature-ready report for the homeowner.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardHeader className="p-0">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Share2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Shareable Link</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <CardDescription>
                  Text or email one link—customer sees everything in one place.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How it works */}
        <section className="py-10">
          <h2 className="text-2xl font-semibold tracking-tight">
            How it works
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                1
              </span>
              <div>
                <h3 className="font-medium">Create a job</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add the job title and customer. You can start from the
                  dashboard.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                2
              </span>
              <div>
                <h3 className="font-medium">Add photos and notes</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload before/after photos and add any closeout notes on-site.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                3
              </span>
              <div>
                <h3 className="font-medium">Seal and share</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Seal the job to generate a report link. Send it to your
                  customer—done.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Footer */}
        <footer className="border-t py-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} JobSealed. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
