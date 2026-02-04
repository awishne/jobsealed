"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ShareReportButtonProps {
  reportUrl: string;
  title: string;
}

export function ShareReportButton({
  reportUrl,
  title,
}: ShareReportButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: title,
          url: reportUrl,
        });
      } catch (error) {
        // User cancelled or error occurred, ignore
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback to copy to clipboard
      try {
        await navigator.clipboard.writeText(reportUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleShare}
    >
      {copied ? "Copied" : "Share"}
    </Button>
  );
}
