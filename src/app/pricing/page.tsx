import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { PricingCards } from "@/components/marketing/PricingCards";

export const metadata: Metadata = {
  title: "Pricing — JobSealed",
  description:
    "Free and Pro plans. Create closeout reports in minutes—photos, notes, Magic Mic, and clean-up tools.",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryCTA = user
    ? { href: "/dashboard", label: "Go to dashboard" }
    : { href: "/login", label: "Start free" };

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <PricingCards
          primaryCTAHref={primaryCTA.href}
          primaryCTALabel={primaryCTA.label}
        />
      </div>
    </main>
  );
}
