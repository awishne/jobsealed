/**
 * Waitlist email templates (inline HTML + plain text). No React-email dependency.
 */

const PRODUCT_NAME = "JobSealed";

// Email-safe font stack (no web fonts; system fallbacks only)
const EMAIL_FONT_STACK =
  "ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"";

export type WaitlistConfirmParams = {
  productName: string;
  email: string;
  siteUrl?: string;
};

export function renderWaitlistConfirmEmail(
  params: WaitlistConfirmParams
): { subject: string; html: string; text: string } {
  const { productName, email, siteUrl } = params;
  const subject = "You're on the JobSealed early access list";

  const origin = (siteUrl || "https://jobsealed.com").replace(/\/$/, "");
  const logoUrl = `${origin}/email-wordmark.png`;

  const wordmarkImg = `<img src="${escapeHtml(logoUrl)}" width="140" alt="JobSealed" style="display:block;border:0;outline:none;text-decoration:none;width:140px;max-width:100%;height:auto;" />`;
  const earlyAccessLabel = `<span style="font-family:${EMAIL_FONT_STACK};font-size:12px;color:#6b7280;letter-spacing:0.08em;text-transform:uppercase;">Early Access</span>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:${EMAIL_FONT_STACK};background-color:#f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">
          <tr>
            <td style="padding:36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #e5e7eb;margin-bottom:28px;padding-bottom:16px;">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    ${wordmarkImg}
                  </td>
                  <td align="right" style="vertical-align:middle;width:1%;white-space:nowrap;">
                    ${earlyAccessLabel}
                  </td>
                </tr>
              </table>
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#111;line-height:1.3;">You're in 🎉</h1>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#333;">Thanks for joining JobSealed Early Access — we'll email you as soon as spots open.</p>
              <ul style="margin:0 0 24px;padding-left:20px;font-size:15px;line-height:1.6;color:#333;">
                <li style="margin-bottom:10px;">Voice notes → customer-ready wording</li>
                <li style="margin-bottom:10px;">Professional, liability-aware phrasing</li>
                <li style="margin-bottom:10px;">Branded reports (logo + review link)</li>
              </ul>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#666;">If you didn't request this, you can ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  const text = [
    "JobSealed",
    "",
    "You're in 🎉",
    "",
    `Thanks for joining JobSealed Early Access — we'll email you as soon as spots open.`,
    "",
    "• Voice notes → customer-ready wording",
    "• Professional, liability-aware phrasing",
    "• Branded reports (logo + review link)",
    "",
    "If you didn't request this, you can ignore this email.",
  ].join("\n");

  return { subject, html, text };
}

export type WaitlistAdminNotifyParams = {
  productName: string;
  email: string;
  source?: string;
  createdAt: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  utm?: Record<string, string | undefined>;
};

export function renderWaitlistAdminNotifyEmail(
  params: WaitlistAdminNotifyParams
): { subject: string; html: string; text: string } {
  const {
    productName,
    email,
    source,
    createdAt,
    ip,
    userAgent,
    referrer,
    utm = {},
  } = params;

  const subject = "New JobSealed waitlist signup";

  const utmKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ] as const;
  const utmRows = utmKeys
    .filter((k) => utm[k] != null && utm[k] !== "")
    .map((k) => `<tr><td style="padding:6px 12px 6px 0;color:#666;">${escapeHtml(k)}</td><td style="padding:6px 0;">${escapeHtml(String(utm[k]))}</td></tr>`)
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;">
    <tr><td style="padding:8px 0;"><strong>Email</strong></td><td style="padding:8px 0;">${escapeHtml(email)}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#666;">Source</td><td style="padding:6px 0;">${escapeHtml(source ?? "(none)")}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#666;">Created at</td><td style="padding:6px 0;">${escapeHtml(createdAt)}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#666;">IP</td><td style="padding:6px 0;">${escapeHtml(ip ?? "(none)")}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#666;">User-Agent</td><td style="padding:6px 0;">${escapeHtml(userAgent ?? "(none)")}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#666;">Referrer</td><td style="padding:6px 0;">${escapeHtml(referrer ?? "(none)")}</td></tr>
    ${utmRows}
  </table>
  <p style="margin-top:16px;font-size:12px;color:#888;">${escapeHtml(productName)} waitlist</p>
</body>
</html>
`.trim();

  const textLines = [
    `Email: ${email}`,
    `Source: ${source ?? "(none)"}`,
    `Created at: ${createdAt}`,
    `IP: ${ip ?? "(none)"}`,
    `User-Agent: ${userAgent ?? "(none)"}`,
    `Referrer: ${referrer ?? "(none)"}`,
    ...utmKeys
      .filter((k) => utm[k] != null && utm[k] !== "")
      .map((k) => `${k}: ${utm[k]}`),
  ];
  const text = textLines.join("\n");

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
