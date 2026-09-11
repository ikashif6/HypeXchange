import { NextResponse } from "next/server";
import { z } from "zod";
import { CONTACT_EMAIL, IPO_LAUNCH_PRICE, offerLabel } from "@/lib/sponsor";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  productName: z.string().trim().min(1).max(120),
  domain: z.string().trim().min(1).max(253),
  ticker: z.string().trim().min(1).max(16),
  message: z.string().trim().max(4000).optional().default(""),
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check the form fields and try again." },
        { status: 400 },
      );
    }

    const apiKey = process.env.AUTH_RESEND_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Email delivery is not configured." },
        { status: 503 },
      );
    }

    const data = parsed.data;
    const offerTitle = offerLabel("ipo");
    const from =
      process.env.AUTH_EMAIL_FROM || "HypeXchange <noreply@hypexchange.space>";
    const subject = `HypeXchange IPO launch — ${data.productName} ($${IPO_LAUNCH_PRICE})`;

    const text = [
      `Offer: ${offerTitle}`,
      `Price: $${IPO_LAUNCH_PRICE} one-time`,
      "",
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone || "-"}`,
      `Product: ${data.productName}`,
      `Domain: ${data.domain}`,
      `Suggested ticker: ${data.ticker}`,
      "",
      "Message:",
      data.message || "-",
    ].join("\n");

    const html = `
      <div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.5;color:#18181b;">
        <p style="margin:0 0 12px;font-size:14px;color:#71717a;">New IPO launch request from hypexchange.space</p>
        <h1 style="margin:0 0 16px;font-size:18px;">${escapeHtml(offerTitle)} — $${IPO_LAUNCH_PRICE}</h1>
        <table style="border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:4px 16px 4px 0;color:#71717a;">Name</td><td>${escapeHtml(data.name)}</td></tr>
          <tr><td style="padding:4px 16px 4px 0;color:#71717a;">Email</td><td>${escapeHtml(data.email)}</td></tr>
          <tr><td style="padding:4px 16px 4px 0;color:#71717a;">Phone</td><td>${escapeHtml(data.phone || "-")}</td></tr>
          <tr><td style="padding:4px 16px 4px 0;color:#71717a;">Product</td><td>${escapeHtml(data.productName)}</td></tr>
          <tr><td style="padding:4px 16px 4px 0;color:#71717a;">Domain</td><td>${escapeHtml(data.domain)}</td></tr>
          <tr><td style="padding:4px 16px 4px 0;color:#71717a;">Ticker</td><td>${escapeHtml(data.ticker)}</td></tr>
          <tr><td style="padding:4px 16px 4px 0;color:#71717a;">Price</td><td>$${IPO_LAUNCH_PRICE} one-time</td></tr>
        </table>
        <p style="margin:16px 0 4px;color:#71717a;font-size:13px;">Message</p>
        <p style="margin:0;white-space:pre-wrap;">${escapeHtml(data.message || "-")}</p>
      </div>
    `.trim();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [CONTACT_EMAIL],
        reply_to: data.email,
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend IPO request failed:", res.status, body);
      return NextResponse.json(
        { error: "Could not send your request. Please try again in a moment." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("IPO request error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
