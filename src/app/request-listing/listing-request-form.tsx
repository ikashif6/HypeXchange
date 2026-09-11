"use client";

import * as React from "react";
import { CATEGORIES, type Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function ListingRequestForm() {
  const [productName, setProductName] = React.useState("");
  const [domain, setDomain] = React.useState("");
  const [suggestedTicker, setSuggestedTicker] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState<Category>("SaaS");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/listing-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          domain,
          suggestedTicker,
          description,
          category,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not submit request.");
        return;
      }
      setDone(true);
      setProductName("");
      setDomain("");
      setSuggestedTicker("");
      setDescription("");
    } catch {
      setError("Could not submit request.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-semibold text-hx-text">Request submitted</p>
          <p className="text-sm text-hx-secondary">
            Admins will review your suggestion. This remains an entertainment listing only.
          </p>
          <Button type="button" variant="secondary" onClick={() => setDone(false)}>
            Submit another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            label="Product name"
            required
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Acme AI"
          />
          <Input
            label="Domain"
            required
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="acme.ai"
          />
          <Input
            label="Suggested ticker"
            required
            value={suggestedTicker}
            onChange={(e) => setSuggestedTicker(e.target.value.toUpperCase())}
            placeholder="ACME"
            maxLength={12}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-xs font-medium text-hx-secondary">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="h-9 rounded-[9px] border border-hx-border bg-hx-card px-3 text-sm text-hx-text outline-none focus:border-hx-primary focus:ring-2 focus:ring-hx-primary/20"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-xs font-medium text-hx-secondary">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="rounded-[9px] border border-hx-border bg-hx-card px-3 py-2 text-sm text-hx-text outline-none focus:border-hx-primary focus:ring-2 focus:ring-hx-primary/20"
              placeholder="What does this product do?"
            />
          </div>
          {error ? <p className="text-xs text-hx-negative">{error}</p> : null}
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Submit request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
