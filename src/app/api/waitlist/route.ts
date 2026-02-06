/**
 * Early Access Waitlist: POST /api/waitlist
 * Table + RLS: see docs/supabase-waitlist-signups.sql and supabase/migrations/20260205_waitlist_signups.sql
 */
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  renderWaitlistConfirmEmail,
  renderWaitlistAdminNotifyEmail,
} from "@/lib/email/waitlistEmail";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_IP = 5;
const PRODUCT_NAME = "JobSealed";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

// In-memory rate limit: IP -> timestamps of requests in window
const ipTimestamps = new Map<string, number[]>();

function getClientIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return null;
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  let timestamps = ipTimestamps.get(ip) ?? [];
  timestamps = timestamps.filter((t) => t > cutoff);
  if (timestamps.length >= MAX_REQUESTS_PER_IP) return true;
  timestamps.push(now);
  ipTimestamps.set(ip, timestamps);
  return false;
}

function validateEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length >= 255) return false;
  if (!trimmed.includes("@") || !trimmed.includes(".")) return false;
  return true;
}

function getUtmFromRequest(request: Request): Record<string, string | undefined> {
  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    return {};
  }
  const utm: Record<string, string | undefined> = {};
  for (const key of UTM_KEYS) {
    const v = url.searchParams.get(key);
    if (v != null && v !== "") utm[key] = v;
  }
  return utm;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (ip && isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { email: rawEmail, source } = body as { email?: unknown; source?: unknown };
  if (!validateEmail(rawEmail)) {
    return NextResponse.json(
      { ok: false, error: "Invalid email" },
      { status: 400 }
    );
  }

  const email = (rawEmail as string).trim().toLowerCase();
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const sourceStr = typeof source === "string" ? source.slice(0, 100) : undefined;
  const referrer = request.headers.get("referer") ?? undefined;
  const utm = getUtmFromRequest(request);

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "JobSealed <hello@jobsealed.com>";
  const notifyTo = process.env.WAITLIST_NOTIFY_TO;

  const supabase = createAdminClient();

  const row = {
    email,
    source: sourceStr ?? null,
    ip,
    user_agent: userAgent ?? null,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("waitlist_signups")
    .insert(row)
    .select("id, created_at")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ ok: true, status: "already_joined" });
    }
    console.error("Waitlist insert error:", insertError.code);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  const createdAt = inserted?.created_at ?? new Date().toISOString();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://jobsealed.com";

  // Only send emails on new join (not on already_joined)
  if (resendKey && from) {
    const resend = new Resend(resendKey);

    // Confirmation email to signup
    try {
      const confirm = renderWaitlistConfirmEmail({
        productName: PRODUCT_NAME,
        email,
        logoUrl: `${siteUrl.replace(/\/$/, "")}/email-logo.png`,
      });
      await resend.emails.send({
        from,
        to: [email],
        subject: confirm.subject,
        html: confirm.html,
        text: confirm.text,
      });
    } catch (err) {
      console.error("Waitlist confirmation email failed");
      // Do not fail the request; signup is already stored. Do not log err (may contain secrets).
    }

    // Admin notification
    if (notifyTo) {
      try {
        const admin = renderWaitlistAdminNotifyEmail({
          productName: PRODUCT_NAME,
          email,
          source: sourceStr,
          createdAt,
          ip: ip ?? undefined,
          userAgent,
          referrer,
          utm: Object.keys(utm).length > 0 ? utm : undefined,
        });
        await resend.emails.send({
          from,
          to: [notifyTo],
          subject: admin.subject,
          html: admin.html,
          text: admin.text,
        });
      } catch (err) {
        console.error("Waitlist admin notify email failed");
        // Do not fail the request; do not log err (may contain secrets).
      }
    }
  }

  return NextResponse.json({
    ok: true,
    status: "joined",
  });
}
