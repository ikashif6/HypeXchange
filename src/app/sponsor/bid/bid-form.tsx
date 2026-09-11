"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CONTACT_EMAIL,
  SPONSOR_STARTING_PRICE,
  offerLabel,
} from "@/lib/sponsor";

export function SponsorBidForm() {
  const searchParams = useSearchParams();
  const offer = searchParams.get("offer") ?? "sponsor";
  const offerTitle = offerLabel(offer);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [amount, setAmount] = React.useState(String(SPONSOR_STARTING_PRICE + 1));
  const [message, setMessage] = React.useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const bidAmount = Number(amount);
    if (!Number.isFinite(bidAmount) || bidAmount < SPONSOR_STARTING_PRICE) {
      return;
    }

    const subject = `HypeXchange bid: ${offerTitle} — $${bidAmount}/day`;
    const body = [
      `Offer: ${offerTitle}`,
      `Bid amount: $${bidAmount}/day`,
      "",
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      `Phone: ${phone.trim() || "-"}`,
      `Company / product: ${company.trim() || "-"}`,
      "",
      "Message:",
      message.trim() || "-",
    ].join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <Card className="rounded-[14px]">
      <CardHeader className="border-b-0 px-5 pt-5 pb-2 sm:px-6">
        <CardTitle className="text-lg">Place a bid</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Bidding on <span className="font-medium text-hx-text">{offerTitle}</span>.
          Submit the form to email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-hx-link underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          . Starting bids are ${SPONSOR_STARTING_PRICE}/day.
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
          />
          <Input
            label="Phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Optional"
          />
          <Input
            label="Company / product"
            name="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="What are you promoting?"
          />
          <Input
            label="Bid amount (USD / day)"
            name="amount"
            inputMode="decimal"
            required
            min={SPONSOR_STARTING_PRICE}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            leftAddon="$"
            hint={`Minimum $${SPONSOR_STARTING_PRICE}/day`}
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="bid-message"
              className="text-xs font-medium text-hx-secondary"
            >
              Message
            </label>
            <textarea
              id="bid-message"
              name="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Launch date, links, or anything we should know"
              className="w-full rounded-[9px] border border-hx-border bg-hx-card px-3 py-2 text-sm text-hx-text outline-none placeholder:text-hx-muted focus:border-hx-primary focus:ring-2 focus:ring-hx-primary/20"
            />
          </div>

          <Button type="submit" size="lg" className="mt-1 w-full">
            Email bid to {CONTACT_EMAIL}
          </Button>

          <p className="text-center text-[11px] leading-relaxed text-hx-muted">
            Opens your email client with the bid details filled in. Prefer another
            channel?{" "}
            <Link href="/founders" className="text-hx-link hover:underline">
              See founder offers
            </Link>
            .
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
