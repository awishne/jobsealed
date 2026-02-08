import { SiteHeader } from "@/components/nav/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera, FileCheck, Share2 } from "lucide-react";
import Link from "next/link";
import { MockAppPreview } from "@/components/marketing/MockAppPreview";
import { ProductTour } from "@/components/marketing/ProductTour";
import { ProWaitlistDialog } from "@/components/marketing/ProWaitlistDialog";

const DEMO = process.env.NEXT_PUBLIC_DEMO_REPORT_TOKEN;
const ENABLE_SIGNUPS = process.env.NEXT_PUBLIC_ENABLE_SIGNUPS === "true";

export default async function Home() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader variant="home" />

      <div className="mx-auto max-w-5xl px-6">
        {/* Hero: two-column on lg, stack on mobile */}
        <section className="py-10 sm:py-14">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-12">
            <div className="flex flex-1 flex-col items-start gap-5">
              <Badge variant="secondary">Job Closeout for Trades</Badge>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                <span className="js-word-left">Job</span>
                <span className="js-word-right">Sealed</span>
              </h1>

              <p className="max-w-2xl text-lg text-muted-foreground">
                Create a clean before/after closeout report in minutes—photos,
                notes, and a shareable link your customer can&apos;t ignore.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg">
                  <Link href="/dashboard">Start a new job</Link>
                </Button>
                {ENABLE_SIGNUPS ? (
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/signup">Sign up</Link>
                  </Button>
                ) : (
                  <ProWaitlistDialog
                    title="Join Early Access"
                    triggerLabel="Join Early Access"
                    triggerVariant="secondary"
                    triggerSize="lg"
                    source="home_hero"
                  />
                )}
                {DEMO ? (
                  <Button asChild size="lg" variant="outline">
                    <Link href={`/r/${DEMO}`}>See an example report</Link>
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
            <div className="w-full lg:max-w-md lg:shrink-0">
              <MockAppPreview />
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

        {/* How it works — interactive product tour */}
        <ProductTour demoReportToken={DEMO ?? null} />

        {/* Bottom CTA band */}
        <section className="py-10">
          <div className="rounded-xl border bg-card px-6 py-8 text-center sm:px-8 sm:py-10">
            <h2 className="text-2xl font-semibold tracking-tight">
              Ready to close out jobs the right way?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Start a new job in seconds, or join early access for the full experience.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Button asChild size="lg">
                <Link href="/dashboard">Start a new job</Link>
              </Button>
              {ENABLE_SIGNUPS ? (
                <Button asChild size="lg" variant="secondary">
                  <Link href="/signup">Sign up</Link>
                </Button>
              ) : (
                <ProWaitlistDialog
                  title="Join Early Access"
                  triggerLabel="Join Early Access"
                  triggerVariant="secondary"
                  triggerSize="lg"
                  source="home_bottom"
                />
              )}
            </div>
          </div>
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
