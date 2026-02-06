"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProWaitlistDialog } from "@/components/marketing/ProWaitlistDialog";

interface HeaderSignupCtaProps {
  enableSignups: boolean;
}

export function HeaderSignupCta({ enableSignups }: HeaderSignupCtaProps) {
  if (enableSignups) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href="/signup">Sign Up</Link>
      </Button>
    );
  }
  return (
    <ProWaitlistDialog
      title="Join Early Access"
      triggerLabel="Join Early Access"
      triggerVariant="ghost"
      triggerSize="sm"
      source="header"
    />
  );
}
