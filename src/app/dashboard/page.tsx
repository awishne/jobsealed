import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your sealed jobs will show up here.
            </p>
          </div>
          <Button>New Seal</Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <div className="text-sm font-medium">Next step</div>
            <div className="mt-1 text-sm text-muted-foreground">
              We’ll add login + “create job” next.
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-sm font-medium">Demo report</div>
            <div className="mt-1 text-sm text-muted-foreground">
              You can already view what customers will see.
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
