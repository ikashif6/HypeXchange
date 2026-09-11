import { ImageResponse } from "next/og";
import { getProfileByUsername } from "@/lib/market/queries";
import { formatIxD, formatPercent } from "@/lib/formatting/decimal";

const BRAND = "#240BCD";
const SIZE = { width: 1200, height: 630 };

export async function GET(req: Request) {
  try {
    const username = new URL(req.url).searchParams.get("username")?.trim();
    if (!username) {
      return new Response("Missing username", { status: 400 });
    }

    let profile: Awaited<ReturnType<typeof getProfileByUsername>> = null;
    try {
      profile = await getProfileByUsername(username);
    } catch {
      profile = null;
    }

    const displayName = profile?.displayName ?? username;
    const handle = `@${profile?.username ?? username.toLowerCase()}`;
    const portfolioValue =
      profile?.portfolioValue != null ? formatIxD(profile.portfolioValue) : "-";
    const returnPct =
      profile?.returnPct != null ? formatPercent(profile.returnPct) : "0.00%";
    const returnPositive = (profile?.returnPct ?? 0) >= 0;
    const cash =
      profile?.cashBalance != null ? formatIxD(profile.cashBalance) : "-";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(145deg, #FFFFFF 0%, #F1F2F4 50%, #EDEAFB 100%)",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          <div style={{ display: "flex", height: 10, width: "100%", background: BRAND }} />
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
                Trader profile
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 64,
                  fontWeight: 700,
                  color: "#111217",
                  letterSpacing: "-0.03em",
                }}
              >
                {displayName}
              </div>
              <div style={{ display: "flex", fontSize: 32, color: "#62656F", fontWeight: 500 }}>
                {handle}
              </div>
            </div>

            <div style={{ display: "flex", gap: 36 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "28px 32px",
                  borderRadius: 16,
                  background: "#FFFFFF",
                  border: "1px solid #E6E7EA",
                  minWidth: 280,
                }}
              >
                <div style={{ display: "flex", color: "#91949D", fontSize: 20, fontWeight: 600 }}>
                  Portfolio
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 40,
                    fontWeight: 700,
                    color: "#111217",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {portfolioValue}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "28px 32px",
                  borderRadius: 16,
                  background: "#FFFFFF",
                  border: "1px solid #E6E7EA",
                  minWidth: 220,
                }}
              >
                <div style={{ display: "flex", color: "#91949D", fontSize: 20, fontWeight: 600 }}>
                  Return
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 40,
                    fontWeight: 700,
                    color: returnPositive ? "#14A673" : "#E5484D",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {returnPct}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "28px 32px",
                  borderRadius: 16,
                  background: "#FFFFFF",
                  border: "1px solid #E6E7EA",
                  minWidth: 220,
                }}
              >
                <div style={{ display: "flex", color: "#91949D", fontSize: 20, fontWeight: 600 }}>
                  Cash
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 40,
                    fontWeight: 700,
                    color: "#111217",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {cash}
                </div>
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
