import { ImageResponse } from "next/og";

const BRAND = "#240BCD";
const SIZE = { width: 1200, height: 630 };

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(145deg, #FFFFFF 0%, #F1F2F4 45%, #EDEAFB 100%)",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          <div style={{ display: "flex", height: 10, width: "100%", background: BRAND }} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "64px 72px",
              justifyContent: "center",
              gap: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                color: BRAND,
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              HypeXchange
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 84,
                fontWeight: 700,
                color: "#111217",
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
              }}
            >
              Leaderboard
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 34,
                color: "#62656F",
                maxWidth: 780,
                lineHeight: 1.35,
              }}
            >
              Ranked traders on the fictional market for internet products.
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 12,
                color: BRAND,
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              A fictional market for internet products
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
