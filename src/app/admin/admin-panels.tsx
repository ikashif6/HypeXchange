"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PendingRequest = {
  id: string;
  productName: string;
  domain: string;
  suggestedTicker: string;
  category: string;
  description: string;
  createdAt: string;
};

type ProductRow = {
  id: string;
  name: string;
  ticker: string;
  slug: string;
  status: string;
  currentPrice: number;
};

export function AdminPanels({
  pendingRequests,
  products,
}: {
  pendingRequests: PendingRequest[];
  products: ProductRow[];
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  async function reviewRequest(id: string, status: "approved" | "rejected") {
    setBusy(`req-${id}-${status}`);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/listing-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Request update failed.");
        return;
      }
      setMessage(`Listing ${status}.`);
      router.refresh();
    } catch {
      setMessage("Request update failed.");
    } finally {
      setBusy(null);
    }
  }

  async function createProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy("create");
    setMessage(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          ticker: form.get("ticker"),
          domain: form.get("domain"),
          description: form.get("description"),
          category: form.get("category"),
          logoUrl: form.get("logoUrl") || undefined,
          status: form.get("status") || "active",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Create failed.");
        return;
      }
      setMessage("Product created.");
      e.currentTarget.reset();
      router.refresh();
    } catch {
      setMessage("Create failed.");
    } finally {
      setBusy(null);
    }
  }

  async function importCsv(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy("import");
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const file = form.get("file") as File | null;
    let csv = String(form.get("csv") ?? "");
    if (file && file.size > 0) {
      csv = await file.text();
    }
    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Import failed.");
        return;
      }
      setMessage(
        `Imported ${data.imported ?? 0}, skipped ${data.skipped ?? 0}, errors ${
          Array.isArray(data.errors) ? data.errors.length : 0
        }.`,
      );
      router.refresh();
    } catch {
      setMessage("Import failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {message ? (
        <p className="rounded-[9px] border border-hx-border bg-hx-card px-3 py-2 text-xs text-hx-secondary">
          {message}
        </p>
      ) : null}

      <section id="listings" className="space-y-3">
        <h2 className="text-sm font-semibold text-hx-text">Pending listing requests</h2>
        <Card>
          <CardContent className="p-0">
            {pendingRequests.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-hx-muted">No pending requests</p>
            ) : (
              <ul className="divide-y divide-hx-border">
                {pendingRequests.map((req) => (
                  <li key={req.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-hx-text">
                        {req.productName}{" "}
                        <span className="font-mono-num text-hx-muted">
                          ${req.suggestedTicker}
                        </span>
                      </p>
                      <p className="text-xs text-hx-muted">
                        {req.domain} · {req.category}
                      </p>
                      {req.description ? (
                        <p className="mt-1 line-clamp-2 text-xs text-hx-secondary">
                          {req.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        loading={busy === `req-${req.id}-approved`}
                        onClick={() => reviewRequest(req.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={busy === `req-${req.id}-rejected`}
                        onClick={() => reviewRequest(req.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section id="products" className="space-y-3">
        <h2 className="text-sm font-semibold text-hx-text">Products</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-hx-border bg-hx-bg/50 text-[11px] uppercase tracking-wide text-hx-muted">
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Ticker</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 text-right font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-hx-border last:border-0">
                      <td className="px-3 py-2">{p.name}</td>
                      <td className="px-3 py-2 font-mono-num">${p.ticker}</td>
                      <td className="px-3 py-2 capitalize">{p.status}</td>
                      <td className="px-3 py-2 text-right font-mono-num">
                        ${p.currentPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="px-4 py-3">
            <CardTitle>Create product</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <form onSubmit={createProduct} className="space-y-3">
              <Input name="name" label="Name" required />
              <Input name="ticker" label="Ticker" required />
              <Input name="domain" label="Domain" required />
              <Input name="logoUrl" label="Logo URL" />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-hx-secondary" htmlFor="admin-cat">
                  Category
                </label>
                <select
                  id="admin-cat"
                  name="category"
                  defaultValue="SaaS"
                  className="h-9 rounded-[9px] border border-hx-border bg-hx-card px-3 text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-hx-secondary" htmlFor="admin-status">
                  Status
                </label>
                <select
                  id="admin-status"
                  name="status"
                  defaultValue="active"
                  className="h-9 rounded-[9px] border border-hx-border bg-hx-card px-3 text-sm"
                >
                  <option value="active">active</option>
                  <option value="paused">paused</option>
                  <option value="upcoming">upcoming</option>
                  <option value="delisted">delisted</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-hx-secondary" htmlFor="admin-desc">
                  Description
                </label>
                <textarea
                  id="admin-desc"
                  name="description"
                  rows={3}
                  className="rounded-[9px] border border-hx-border bg-hx-card px-3 py-2 text-sm"
                />
              </div>
              <Button type="submit" loading={busy === "create"}>
                Create
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 py-3">
            <CardTitle>CSV bulk import</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <form onSubmit={importCsv} className="space-y-3">
              <p className="text-xs text-hx-muted">
                Columns: name,ticker,domain,description,category,logo_url
              </p>
              <textarea
                name="csv"
                rows={8}
                placeholder="name,ticker,domain,description,category,logo_url"
                className="w-full rounded-[9px] border border-hx-border bg-hx-card px-3 py-2 font-mono text-xs"
              />
              <Input name="file" type="file" accept=".csv,text/csv" label="Or upload CSV file" />
              <Button type="submit" variant="secondary" loading={busy === "import"}>
                Import
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
