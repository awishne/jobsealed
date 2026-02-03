import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function DemoReportPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Sealed Job Report
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Demo report (what the homeowner sees)
            </p>
          </div>
          <Badge className="text-sm">Verified Seal</Badge>
        </div>

        <div className="mt-8 grid gap-4">
          <Card className="p-5">
            <div className="text-sm font-medium">Client</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Jane Smith — 123 Main St, Chicago, IL
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-sm font-medium">Summary</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Replaced a corroded shutoff valve under kitchen sink, tested for leaks,
              verified water pressure, and cleaned work area.
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-sm font-medium">Before / After</div>
            <div className="mt-1 text-sm text-muted-foreground">
              (Next step: we’ll add image upload + a before/after slider.)
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
