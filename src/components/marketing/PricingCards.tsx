import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProWaitlistDialog } from "./ProWaitlistDialog";

interface PricingCardsProps {
  primaryCTAHref: string;
  primaryCTALabel: string;
}

const STARTER_FEATURES = [
  { text: "Before/after photo report", muted: false },
  { text: "Shareable homeowner link", muted: false },
  { text: "Manual note entry", muted: true },
];

const PRO_FEATURES = [
  "Unlimited jobs & photos",
  "Voice notes inside the app (no copy/paste)",
  "One-tap customer-ready notes + Undo",
  "Branded reports (logo + review link)",
  "Safer wording for risky terms (you approve everything)",
];

export function PricingCards({
  primaryCTAHref,
  primaryCTALabel,
}: PricingCardsProps) {
  return (
    <>
      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          PLANS
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">
          Stop typing closeout reports.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
          Talk your notes. Tap once. Send a customer-ready report.
        </p>
      </section>

      {/* Example – compact proof box */}
      <section className="mt-6 max-w-3xl mx-auto sm:mt-8">
        <Card className="flex flex-col gap-2 border bg-muted/30 py-3 px-4 sm:py-4 sm:px-5">
          <CardHeader className="pb-2 px-0 pt-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Example
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 px-0 pt-0 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Before (dictated notes)</p>
              <p className="mt-0.5 font-mono text-sm leading-snug text-foreground/90">
                uh toilet running… replaced flapper n fill valve tested ok
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">After (customer-ready)</p>
              <p className="mt-0.5 text-sm leading-snug text-foreground">
                The technician repaired a continuously running toilet by replacing the flapper and fill valve. The fixture was tested and is operating normally.
              </p>
            </div>
          </CardContent>
        </Card>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          You control the final text. Undo anytime.
        </p>
      </section>

      {/* Cards */}
      <section className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 sm:gap-8">
        {/* Starter */}
        <Card className="flex flex-col p-6 sm:p-8">
          <CardHeader className="pb-4 px-0 pt-0">
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-xl">Starter</CardTitle>
              <span className="text-3xl font-bold tracking-tight">$0</span>
            </div>
            <CardDescription className="mt-1">
              <span className="font-semibold text-foreground">3 sealed jobs / month (resets monthly)</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 px-0 pt-0">
            <ul className="space-y-3">
              {STARTER_FEATURES.map((f) => (
                <li
                  key={f.text}
                  className={`flex items-center gap-2 text-sm ${f.muted ? "text-muted-foreground" : ""}`}
                >
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="px-0 pt-6">
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href={primaryCTAHref}>{primaryCTALabel}</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Pro */}
        <Card className="relative flex flex-col border-2 border-amber-500/40 bg-amber-50/40 p-6 shadow-2xl shadow-amber-500/10 dark:bg-amber-950/20 sm:-translate-y-1 sm:p-8">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-xs font-medium text-white shadow-md">
              Most popular
            </Badge>
          </div>
          <CardHeader className="pb-4 px-0 pt-6 sm:pt-6">
            <div className="flex flex-wrap items-baseline gap-2">
              <CardTitle className="text-xl">Pro</CardTitle>
              <span className="text-3xl font-bold tracking-tight">$29 / mo</span>
              <span className="text-xs text-muted-foreground">(coming soon)</span>
            </div>
            <CardDescription className="font-medium text-foreground">
              Save time on every job.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 px-0 pt-0">
            <ul className="space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="px-0 pt-6">
            <ProWaitlistDialog
              source="pricing"
              buttonClassName="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 sm:w-auto"
            />
          </CardFooter>
        </Card>
      </section>

      {/* FAQ */}
      <section className="mt-14 border-t pt-10 sm:mt-16 sm:pt-12">
        <h2 className="text-lg font-semibold tracking-tight">
          Frequently asked
        </h2>
        <dl className="mt-6 space-y-6">
          <div>
            <dt className="font-medium text-foreground">
              How much time does it save?
            </dt>
            <dd className="mt-1 text-sm text-muted-foreground">
              Voice notes + one-tap polish = minutes instead of typing.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">
              How does customer-ready wording work?
            </dt>
            <dd className="mt-1 text-sm text-muted-foreground">
              It cleans up wording and structure. You control the final notes and can undo anytime.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">
              Does it add details?
            </dt>
            <dd className="mt-1 text-sm text-muted-foreground">
              No. It keeps your facts and improves clarity only. You control the final text.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">
              When is Pro available?
            </dt>
            <dd className="mt-1 text-sm text-muted-foreground">
              Join the waitlist and we&apos;ll email you as soon as Pro launches.
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}
