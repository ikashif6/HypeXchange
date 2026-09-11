import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/market/queries";
import { formatPercent, formatPrice } from "@/lib/formatting/decimal";

const BRAND = "#240BCD";
const SIZE = { width: 1200, height: 630 };

export async function GET(req: Request) {
  try {
    const slug = new URL(req.url).searchParams.get("slug")?.trim();
    if (!slug) {
      return new Response("Missing slug", { status: 400 });
    }

    let product: Awaited<ReturnType<typeof getProductBySlug>> = null;
    try {
      product = await getProductBySlug(slug);
    } catch {
      product = null;
    }

    const name = product?.name ?? "Product";
    const ticker = product?.ticker ?? "-";
    const price = product ? formatPrice(product.currentPrice) : "-";
    const change = product ? formatPercent(product.change24h) : "0.00%";
    const changePositive = (product?.change24h ?? 0) >= 0;
    const category = product?.category ?? "Internet";
    const domain = product?.domain ?? "hypexchange.space";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(145deg, #FFFFFF 0%, #F1F2F4 55%, #EDEAFB 100%)",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              height: 10,
              width: "100%",
              background: BRAND,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "56px 64px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  color: BRAND,
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                HypeXchange
              </div>
              <div
                style={{
                  display: "flex",
                  padding: "10px 18px",
                  borderRadius: 999,
                  background: "#F1EFFF",
                  color: BRAND,
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                {category}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 72,
                    fontWeight: 700,
                    color: "#111217",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                  }}
                >
                  {name}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 36,
                    fontWeight: 600,
                    color: "#62656F",
                  }}
                >
                  {ticker}
                </div>
              </div>
              <div style={{ display: "flex", color: "#91949D", fontSize: 26 }}>{domain}</div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", color: "#91949D", fontSize: 22, fontWeight: 600 }}>
                  Price (IXD)
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 18,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 64,
                      fontWeight: 700,
                      color: "#111217",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {price}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 32,
                      fontWeight: 600,
                      color: changePositive ? "#14A673" : "#E5484D",
                    }}
                  >
                    {change} 24h
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", color: "#62656F", fontSize: 24 }}>
                A fictional market for internet products
              </div>
            </div>
          </div>
        </div>
      ),
      SIZE,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "OG render failed";
    return new Response(message, { status: 500 });
  }
}
