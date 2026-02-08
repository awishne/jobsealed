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

const RATE_LIMIT_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_SECONDS = 600;
const PRODUCT_NAME = "JobSealed";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

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

function isAllowedOrigin(request: Request): boolean {
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return true;
  const base = siteUrl.replace(/\/$/, "").toLowerCase();
  const origin = request.headers.get("origin")?.toLowerCase() ?? "";
  const referer = request.headers.get("referer")?.toLowerCase() ?? "";
  if (origin && origin.startsWith(base)) return true;
  if (referer && referer.startsWith(base)) return true;
  if (
    origin.startsWith("http://localhost:3000") ||
    referer.startsWith("http://localhost:3000")
  )
    return true;
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
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { ok: false, error: "server_misconfigured" },
      { status: 500 }
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

  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const ip = getClientIp(request);

  const supabaseAdmin = createAdminClient();

  if (ip !== null) {
    const { data: rateLimitData, error: rateLimitError } = await supabaseAdmin.rpc(
      "waitlist_rate_limit_hit",
      {
        p_ip: ip,
        p_limit: RATE_LIMIT_PER_WINDOW,
        p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
      }
    );
    if (rateLimitError) {
      console.error("waitlist_rate_limit_hit rpc error", rateLimitError);
      return NextResponse.json(
        { ok: false, error: "rate_limit_check_failed" },
        { status: 500 }
      );
    }
    const row = Array.isArray(rateLimitData) ? rateLimitData[0] : rateLimitData;
    if (!row || typeof row.allowed !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "rate_limit_check_failed" },
        { status: 500 }
      );
    }
    if (row.allowed === false) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429 }
      );
    }
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

  const row = {
    email,
    source: sourceStr ?? null,
    ip,
    user_agent: userAgent ?? null,
  };

  const { data: inserted, error: insertError } = await supabaseAdmin
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

  // Used for absolute image URLs in confirmation email. Defaults to www.jobsealed.com for production.
  // Locally: set SITE_URL=http://localhost:3000
  // Production (Vercel): set SITE_URL=https://www.jobsealed.com
  const siteUrlRaw =
    process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.jobsealed.com";
  const siteUrl = siteUrlRaw.replace(/\/$/, "");
  const logoUrl = `${siteUrl}/email-wordmark@2x.png`;

  // Only send emails on new join (not on already_joined)
  if (resendKey && from) {
    const resend = new Resend(resendKey);

    // Confirmation email to signup
    try {
      const confirm = renderWaitlistConfirmEmail({
        productName: PRODUCT_NAME,
        email,
        logoUrl,
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
