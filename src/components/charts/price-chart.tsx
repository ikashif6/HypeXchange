"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatting/decimal";

export interface PriceChartPoint {
  t: string | number;
  price: number;
}

export interface PriceChartProps {
  data: PriceChartPoint[];
  className?: string;
  height?: number;
  showAxes?: boolean;
  periodControls?: React.ReactNode;
  /** Use inside an existing Card to avoid double borders/padding. */
  embedded?: boolean;
}

function formatTickLabel(value: string | number): string {
  if (typeof value === "number") return String(value);
  const raw = value.trim();
  if (!raw) return "";

  // Already short labels (ticker, Cash, etc.)
  if (!/^\d{4}-\d{2}-\d{2}/.test(raw) && !raw.includes("T")) {
    return raw.length > 12 ? `${raw.slice(0, 10)}…` : raw;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw.slice(0, 10);

  const now = Date.now();
  const diffH = Math.abs(now - date.getTime()) / 3_600_000;

  if (diffH < 36) {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const price = payload[0]?.value;
  if (price == null) return null;

  return (
    <div className="rounded-[8px] border border-hx-border bg-hx-card px-2.5 py-1.5 shadow-sm">
      <p className="text-[10px] text-hx-muted">{formatTickLabel(label ?? "")}</p>
      <p className="font-mono-num text-xs font-semibold text-hx-text">
        ${formatPrice(price)}
      </p>
    </div>
  );
}

export function PriceChart({
  data,
  className,
  height = 260,
  showAxes = true,
  periodControls,
  embedded = false,
}: PriceChartProps) {
  const chartData = React.useMemo(
    () =>
      data.map((d) => ({
        ...d,
        label: formatTickLabel(d.t),
      })),
    [data],
  );

  const [colors, setColors] = React.useState({
    primary: "#240BCD",
    grid: "#E6E7EA",
    muted: "#91949D",
  });

  React.useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    setColors({
      primary: styles.getPropertyValue("--hx-primary").trim() || "#240BCD",
      grid: styles.getPropertyValue("--hx-chart-grid").trim() || "#E6E7EA",
      muted: styles.getPropertyValue("--hx-muted").trim() || "#91949D",
    });

    const observer = new MutationObserver(() => {
      const next = getComputedStyle(document.documentElement);
      setColors({
        primary: next.getPropertyValue("--hx-primary").trim() || "#240BCD",
        grid: next.getPropertyValue("--hx-chart-grid").trim() || "#E6E7EA",
        muted: next.getPropertyValue("--hx-muted").trim() || "#91949D",
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const gradientId = React.useId().replace(/:/g, "");

  const body = !chartData.length ? (
    <div
      className="flex items-center justify-center text-xs text-hx-muted"
      style={{ height }}
    >
      No price history yet
    </div>
  ) : (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 16,
            right: 16,
            left: 8,
            bottom: showAxes ? 12 : 4,
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.primary} stopOpacity={0.2} />
              <stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={colors.grid}
            strokeDasharray="3 3"
            vertical={false}
            strokeOpacity={0.9}
          />
          {showAxes ? (
            <>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                minTickGap={48}
                tick={{ fill: colors.muted, fontSize: 11 }}
                tickMargin={10}
                dy={4}
              />
              <YAxis
                width={68}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                domain={["auto", "auto"]}
                padding={{ top: 12, bottom: 12 }}
                tick={{ fill: colors.muted, fontSize: 11 }}
                tickFormatter={(v: number) => `$${formatPrice(v, 2)}`}
              />
            </>
          ) : null}
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={colors.primary}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 0, fill: colors.primary }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  if (embedded) {
    return (
      <div className={cn("w-full", className)}>
        {periodControls ? (
          <div className="mb-3 flex items-center justify-end">{periodControls}</div>
        ) : null}
        {body}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[10px] border border-hx-border bg-hx-card",
        className,
      )}
    >
      {periodControls ? (
        <div className="flex h-11 items-center justify-end border-b border-hx-border px-4">
          {periodControls}
        </div>
      ) : null}
      <div className="px-3 pt-2 pb-3">{body}</div>
    </div>
  );
}
