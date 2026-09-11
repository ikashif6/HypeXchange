"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CONTACT_EMAIL, IPO_LAUNCH_PRICE } from "@/lib/sponsor";

export function IpoRequestForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [productName, setProductName] = React.useState("");
  const [domain, setDomain] = React.useState("");
  const [ticker, setTicker] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/sponsor/ipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          productName: productName.trim(),
          domain: domain.trim(),
          ticker: ticker.trim().toUpperCase(),
          message: message.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Could not send your request.");
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setPhone("");
      setProductName("");
      setDomain("");
      setTicker("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Could not send your request.",
      );
    }
  }

  if (status === "sent") {
    return (
      <Card className="rounded-[14px]">
        <CardHeader className="border-b-0 px-5 pt-5 pb-2 sm:px-6">
          <CardTitle className="text-lg">Request sent</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Thanks — your IPO launch request was forwarded to{" "}
            <span className="font-medium text-hx-text">{CONTACT_EMAIL}</span>. We will
            follow up by email.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 px-5 pb-6 pt-3 sm:px-6">
          <Button type="button" variant="outline" onClick={() => setStatus("idle")}>
            Send another request
          </Button>
          <Link
            href="/founders"
            className="text-center text-sm font-medium text-hx-link hover:underline"
          >
            Back to founder offers
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[14px]">
      <CardHeader className="border-b-0 px-5 pt-5 pb-2 sm:px-6">
        <CardTitle className="text-lg">Request a featured IPO</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Fixed ${IPO_LAUNCH_PRICE} one-time launch fee. We email your details to{" "}
          {CONTACT_EMAIL}.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-6 pt-3 sm:px-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <Input
            label="Name"
            name="name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={status === "sending"}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@startup.com"
            disabled={status === "sending"}
          />
          <Input
            label="Phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Optional"
            disabled={status === "sending"}
          />
          <Input
            label="Product name"
            name="productName"
            required
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Acme"
            disabled={status === "sending"}
          />
          <Input
            label="Domain / website"
            name="domain"
            required
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="acme.com"
            disabled={status === "sending"}
          />
          <Input
            label="Suggested ticker"
            name="ticker"
            required
            value={ticker}
            onChange={(e) =>
              setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))
            }
            placeholder="ACME"
            hint="3–8 characters"
            disabled={status === "sending"}
          />
          <Input
            label="Launch fee"
            name="price"
            value={String(IPO_LAUNCH_PRICE)}
            leftAddon="$"
            hint="One-time featured IPO fee"
            readOnly
            disabled
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="ipo-message"
              className="text-xs font-medium text-hx-secondary"
            >
              Message
            </label>
            <textarea
              id="ipo-message"
              name="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Launch date, category, or anything we should know"
              disabled={status === "sending"}
              className="w-full rounded-[9px] border border-hx-border bg-hx-card px-3 py-2 text-sm text-hx-text outline-none placeholder:text-hx-muted focus:border-hx-primary focus:ring-2 focus:ring-hx-primary/20 disabled:opacity-60"
            />
          </div>

          {error ? (
            <p className="text-sm text-hx-negative" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending…" : "Submit IPO request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
