import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jobsealed.com"),
  title: "JobSealed — Seal the job. Get paid.",
  description:
    "Create clean before/after closeout reports in minutes—photos, notes, and a shareable link.",
  openGraph: {
    title: "JobSealed — Seal the job. Get paid.",
    description:
      "Create clean before/after closeout reports in minutes—photos, notes, and a shareable link.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobSealed — Seal the job. Get paid.",
    description:
      "Create clean before/after closeout reports in minutes—photos, notes, and a shareable link.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
