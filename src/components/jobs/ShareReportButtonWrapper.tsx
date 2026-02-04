"use client";

import { ShareReportButton } from "./ShareReportButton";

interface ShareReportButtonWrapperProps {
  publicToken: string;
  title: string;
}

export function ShareReportButtonWrapper({
  publicToken,
  title,
}: ShareReportButtonWrapperProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const reportUrl = `${baseUrl}/r/${publicToken}`;

  return <ShareReportButton reportUrl={reportUrl} title={title} />;
}
