import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { PricingCards } from "@/components/marketing/PricingCards";

export const metadata: Metadata = {
  title: "Pricing — JobSealed",
  description:
    "Stop typing closeout reports. Talk your notes, polish in one tap, send customer-ready reports. Starter: 3 jobs/mo, typed notes. Pro $29/mo: voice notes, one-tap wording, branded reports.",
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
      <div className="mx-auto max-w-5xl px-4 pt-16 pb-8 sm:px-6 sm:pt-20 sm:pb-12">
        <PricingCards
          primaryCTAHref={primaryCTA.href}
          primaryCTALabel={primaryCTA.label}
        />
      </div>
    </main>
  );
}
