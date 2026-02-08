"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { ClipboardList, FileImage, LayoutDashboard, FileCheck } from "lucide-react";

const STEPS = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Create a job from the dashboard and see all your jobs in one place.",
    icon: LayoutDashboard,
  },
  {
    id: "details",
    title: "Job details",
    description: "Add job title and customer info. One form and you're ready for photos.",
    icon: ClipboardList,
  },
  {
    id: "photos",
    title: "Photo upload",
    description: "Snap before/after photos on-site and add notes. Organize by room or area.",
    icon: FileImage,
  },
  {
    id: "report",
    title: "Sealed report",
    description: "Seal the job to generate a shareable report link for your customer.",
    icon: FileCheck,
  },
] as const;

interface ProductTourProps {
  /** If set, show "Open example report" button in the final step linking to /r/{demoReportToken} */
  demoReportToken?: string | null;
}

export function ProductTour({ demoReportToken }: ProductTourProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <section className="py-10">
      <h2 className="text-2xl font-semibold tracking-tight">
        How it works
      </h2>
      <p className="mt-1 text-muted-foreground">
        See it in action — follow the flow from dashboard to shareable report.
      </p>

      {/* Step tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
              step === i
                ? "border-amber-500/60 bg-amber-500/10 text-amber-800 dark:border-amber-400/50 dark:bg-amber-500/15 dark:text-amber-200"
                : "border-border bg-background hover:bg-muted/50"
            )}
          >
            <s.icon className="h-4 w-4 shrink-0" />
            {s.title}
          </button>
        ))}
      </div>

      {/* Screenshot-like card for current step */}
      <Card className="mt-6 overflow-hidden border-2 shadow-xl">
        <CardHeader className="border-b bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5" aria-hidden>
              <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            </div>
            <span className="text-xs text-muted-foreground">{current.title}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-4 py-3 sm:px-5 sm:py-4">
            <p className="text-sm text-muted-foreground">{current.description}</p>

            {/* Mock UI per step */}
            <div className="mt-4 rounded-lg border bg-muted/20 p-3 sm:p-4">
              {step === 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">My jobs</span>
                    <Badge variant="secondary">New job</Badge>
                  </div>
                  <ul className="space-y-2">
                    {["Kitchen remodel — Smith", "Bath closeout — Jones", "Deck finish — Lee"].map((job, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm"
                      >
                        {job}
                        <span className="text-xs text-muted-foreground">Open</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Job title</label>
                    <div className="h-8 rounded border bg-background" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Customer</label>
                    <div className="h-8 rounded border bg-background" />
                  </div>
                  <Button size="sm" className="mt-2">
                    Save & continue
                  </Button>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {["Before", "After", "Before", "After"].map((label, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 rounded-md border p-2",
                          "bg-gradient-to-br from-muted/50 to-muted/25 dark:from-muted/40 dark:to-muted/20"
                        )}
                      >
                        <FileImage className="h-5 w-5 text-muted-foreground/50" aria-hidden />
                        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                  <Button size="sm">Add photos</Button>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-3">
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2",
                      "border-emerald-500/40 bg-emerald-500/10 dark:border-emerald-400/30 dark:bg-emerald-500/15"
                    )}
                  >
                    <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                      Sealed
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    One link to share — your customer sees before/after, notes, and sign-off.
                  </p>
                  {demoReportToken ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/r/${demoReportToken}`}>Open example report</Link>
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="outline" disabled>
                        Open example report
                      </Button>
                      <p className="text-xs text-muted-foreground">Demo report coming soon</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
