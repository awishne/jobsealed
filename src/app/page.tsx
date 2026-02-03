import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";


export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="secondary">Job Closeout for Trades</Badge>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Seal the job. <span className="text-muted-foreground">Get paid.</span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground">
            Stop sending messy texts. Create a clean before/after closeout report in
            minutes—photos, notes, and a shareable link your customer can’t ignore.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">Start a new job</Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/report/demo">See an example report</Link>
            </Button>
          </div>


          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <div className="text-sm font-medium">Before / After</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Snap photos on-site and organize them instantly.
              </div>
            </Card>
            <Card className="p-5">
              <div className="text-sm font-medium">Professional Closeout</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Notes + signature-ready report page for the homeowner.
              </div>
            </Card>
            <Card className="p-5">
              <div className="text-sm font-medium">Shareable Link</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Text it. Email it. Customer sees everything in one place.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
