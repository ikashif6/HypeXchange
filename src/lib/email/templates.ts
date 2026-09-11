/**
 * Transactional email layout adapted from Agentra's email shell design,
 * rebranded for HypeXchange (structure, spacing, card shell, not Agentra copy/colors).
 */

const BRAND = {
  primary: "#240BCD",
  primaryHover: "#1D08AD",
  text: "#1A1D26",
  muted: "#5C6578",
  faint: "#8B93A7",
  border: "#E5E7EB",
  surface: "#F7F7F8",
  canvas: "#EEF0F3",
  callout: "#F1EFFF",
  calloutBorder: "#D9D4F5",
  white: "#FFFFFF",
} as const;

const FONT_HEADING =
  "'Geist', 'Plus Jakarta Sans', 'Trebuchet MS', 'Lucida Grande', Helvetica, Arial, sans-serif";
const FONT_BODY =
  "'Geist', 'Plus Jakarta Sans', 'Trebuchet MS', 'Lucida Grande', Helvetica, Arial, sans-serif";

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://hypexchange.space").replace(
  /\/$/,
  "",
);
const CONTACT_EMAIL = "contact@hypexchange.space";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function emailButton(href: string, label: string, background = BRAND.primary): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0 16px;width:100%;">
      <tr>
        <td width="100%" style="width:100%;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${href}" style="height:48px;v-text-anchor:middle;width:520px;" arcsize="12%" stroke="f" fillcolor="${background}">
            <center style="color:${BRAND.white};font-family:Arial,sans-serif;font-size:15px;font-weight:700;">${escapeHtml(label)}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-- -->
          <a href="${href}"
             style="display:block;width:100%;box-sizing:border-box;background-color:${background};color:${BRAND.white};padding:15px 22px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;line-height:1.25;text-align:center;font-family:${FONT_BODY};mso-hide:all;">
            ${escapeHtml(label)}
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>`;
}

function emailNotice(html: string): string {
  return `<p style="margin:0 0 28px;color:${BRAND.faint};font-size:13px;line-height:1.55;font-family:${FONT_BODY};">* ${html}</p>`;
}

function emailHeading(title: string): string {
  return `<h1 style="margin:0 0 20px;color:${BRAND.text};font-size:28px;line-height:1.25;font-weight:700;font-family:${FONT_HEADING};">${title}</h1>`;
}

function emailParagraph(html: string, { muted = false, size = 16 } = {}): string {
  return `<p style="margin:0 0 18px;color:${muted ? BRAND.muted : BRAND.text};font-size:${size}px;line-height:1.65;font-family:${FONT_BODY};">${html}</p>`;
}

function emailSection(title: string, bodyHtml: string): string {
  return `
    <div style="margin:32px 0 0;">
      <p style="margin:0 0 10px;color:${BRAND.text};font-size:15px;font-weight:700;font-family:${FONT_BODY};">${escapeHtml(title)}</p>
      <div style="color:${BRAND.text};font-size:15px;line-height:1.65;font-family:${FONT_BODY};">
        ${bodyHtml}
      </div>
    </div>`;
}

function emailSignOff(): string {
  return `<p style="margin:36px 0 0;color:${BRAND.text};font-size:15px;line-height:1.6;font-family:${FONT_BODY};">The <strong>HypeXchange</strong> team</p>`;
}

function emailCallout(title: string, bodyHtml: string): string {
  const titleHtml = title
    ? `<p style="margin:0 0 6px;color:${BRAND.text};font-size:14px;font-weight:600;font-family:${FONT_BODY};">${escapeHtml(title)}</p>`
    : "";
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:8px 0 0;">
      <tr>
        <td style="background:${BRAND.callout};border:1px solid ${BRAND.calloutBorder};border-radius:8px;padding:16px 18px;">
          ${titleHtml}
          <div style="color:${BRAND.muted};font-size:14px;line-height:1.55;font-family:${FONT_BODY};">
            ${bodyHtml}
          </div>
        </td>
      </tr>
    </table>`;
}

function logoUrl(): string {
  if (process.env.EMAIL_LOGO_URL) return process.env.EMAIL_LOGO_URL;
  return `${SITE_URL}/brand/logo-white-bg.png`;
}

function emailShell(options: {
  title?: string;
  preheader?: string;
  bodyHtml: string;
  footerNote?: string;
}): string {
  const {
    title = "HypeXchange",
    preheader = "",
    bodyHtml = "",
    footerNote = "",
  } = options;

  const year = new Date().getFullYear();
  const logoSrc = logoUrl();
  const preheaderHtml = preheader
    ? `<div style="display:none;font-size:1px;color:${BRAND.canvas};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>`
    : "";

  const headerHtml = `
    <a href="${SITE_URL}" style="text-decoration:none;display:inline-block;line-height:0;">
      <img src="${logoSrc}" alt="HypeXchange" width="168" height="38" style="display:block;width:168px;max-width:168px;height:auto;border:0;outline:none;" />
    </a>`;

  const footerBrandHtml = `
    <a href="${SITE_URL}" style="text-decoration:none;display:inline-block;line-height:0;">
      <img src="${logoSrc}" alt="HypeXchange" width="120" height="27" style="display:block;width:120px;max-width:120px;height:auto;border:0;" />
    </a>`;

  const footerLinksHtml = `
    <a href="${SITE_URL}/terms" style="color:${BRAND.faint};text-decoration:underline;">Terms</a>
    &nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="${SITE_URL}/privacy" style="color:${BRAND.faint};text-decoration:underline;">Privacy</a>
    &nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="${SITE_URL}/disclaimer" style="color:${BRAND.faint};text-decoration:underline;">Disclaimer</a>
    &nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="mailto:${CONTACT_EMAIL}" style="color:${BRAND.faint};text-decoration:underline;">Contact</a>`;

  const footerNoteHtml = footerNote
    ? `<p style="margin:0 0 12px;">${footerNote}</p>`
    : `<p style="margin:0 0 12px;">You received this email because you requested a sign-in link for HypeXchange.</p>`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>${escapeHtml(title)}</title>
  <style type="text/css">
    :root { color-scheme: light only; supported-color-schemes: light only; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body, .email-bg { background-color: ${BRAND.canvas} !important; }
    .email-card, .email-card td { background-color: ${BRAND.white} !important; }
    @media (prefers-color-scheme: dark) {
      body, .email-bg { background-color: ${BRAND.canvas} !important; }
      .email-card, .email-card td { background-color: ${BRAND.white} !important; color: ${BRAND.text} !important; }
    }
  </style>
  <!--[if gte mso 9]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
</head>
<body class="email-bg" style="margin:0;padding:0;background-color:${BRAND.canvas};font-family:${FONT_BODY};">
  ${preheaderHtml}
  <table role="presentation" class="email-bg" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="${BRAND.canvas}" style="background-color:${BRAND.canvas};">
    <tr>
      <td align="center" class="email-bg" bgcolor="${BRAND.canvas}" style="padding:32px 16px;background-color:${BRAND.canvas};">
        <table role="presentation" class="email-card" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="${BRAND.white}" style="max-width:600px;width:100%;background-color:${BRAND.white};">
          <tr>
            <td bgcolor="${BRAND.white}" style="padding:40px 40px 24px;background-color:${BRAND.white};">
              ${headerHtml}
            </td>
          </tr>
          <tr>
            <td bgcolor="${BRAND.white}" style="padding:8px 40px 40px;font-family:${FONT_BODY};color:${BRAND.text};background-color:${BRAND.white};">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td bgcolor="${BRAND.white}" style="padding:8px 40px 0;background-color:${BRAND.white};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr><td style="border-top:1px solid ${BRAND.border};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td bgcolor="${BRAND.white}" style="padding:28px 40px 14px;background-color:${BRAND.white};">
              ${footerBrandHtml}
            </td>
          </tr>
          <tr>
            <td bgcolor="${BRAND.white}" style="padding:8px 40px 16px;font-family:${FONT_BODY};font-size:12px;line-height:1.8;color:${BRAND.faint};background-color:${BRAND.white};">
              ${footerLinksHtml}
            </td>
          </tr>
          <tr>
            <td bgcolor="${BRAND.white}" style="padding:4px 40px 40px;font-family:${FONT_BODY};font-size:12px;line-height:1.7;color:${BRAND.faint};background-color:${BRAND.white};">
              ${footerNoteHtml}
              <p style="margin:0;">© ${year} HypeXchange. All rights reserved.</p>
              <p style="margin:8px 0 0;">Questions? <a href="mailto:${CONTACT_EMAIL}" style="color:${BRAND.faint};text-decoration:underline;">${CONTACT_EMAIL}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildMagicLinkEmail({
  url,
  email,
}: {
  url: string;
  email: string;
}): { subject: string; html: string; text: string } {
  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return "hypexchange.space";
    }
  })();

  const local = email.split("@")[0] || "there";
  const firstName = local.charAt(0).toUpperCase() + local.slice(1);

  const html = emailShell({
    title: "Your sign-in link",
    preheader: "Your one-tap sign-in link for HypeXchange is ready.",
    bodyHtml: `
      ${emailHeading("Your sign-in link is ready")}
      ${emailParagraph(`Hi ${escapeHtml(firstName)},`)}
      ${emailParagraph(
        `Tap below to jump straight into <strong>HypeXchange</strong>, the fictional market where you trade internet products with IXD. No password typing required.`,
      )}
      ${emailButton(url, "Sign in to HypeXchange")}
      ${emailNotice("This link expires shortly and can only be used once.")}
      ${emailCallout(
        "Fictional market reminder",
        "IXD has no real-world value. Virtual shares do not represent ownership or equity in any company.",
      )}
      ${emailSection(
        "Keep your account secure:",
        `If you didn’t ask for this link, ignore this email. Your account stays locked up tight.`,
      )}
      ${emailSection(
        "We’re here to help",
        `Questions? Email us at <a href="mailto:${CONTACT_EMAIL}" style="color:${BRAND.primary};text-decoration:underline;">${CONTACT_EMAIL}</a>.`,
      )}
      ${emailSignOff()}
    `,
  });

  const text = [
    `Hi ${firstName},`,
    ``,
    `Sign in to HypeXchange:`,
    url,
    ``,
    `This link expires shortly and can only be used once.`,
    ``,
    `If you didn't request this, ignore this email.`,
    ``,
    `Questions: ${CONTACT_EMAIL}`,
    `HypeXchange · ${host}`,
  ].join("\n");

  return {
    subject: "Your HypeXchange sign-in link",
    html,
    text,
  };
}

export { CONTACT_EMAIL, SITE_URL };
