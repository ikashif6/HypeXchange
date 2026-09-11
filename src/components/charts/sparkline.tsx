"use client";

import * as React from "react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { cn } from "@/lib/utils";

export interface SparklineProps {
  data: number[] | Array<{ price: number }>;
  className?: string;
  width?: number;
  height?: number;
  positive?: boolean;
}

export function Sparkline({
  data,
  className,
  width = 72,
  height = 28,
  positive,
}: SparklineProps) {
  const points = data.map((d) => (typeof d === "number" ? { price: d } : d));
  if (points.length < 2) {
    return (
      <div
        className={cn("inline-block", className)}
        style={{ width, height }}
        aria-hidden
      />
    );
  }

  const first = points[0].price;
  const last = points[points.length - 1].price;
  const up = positive ?? last >= first;
  const [stroke, setStroke] = React.useState(up ? "#14A673" : "#E5484D");

  React.useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const pos = styles.getPropertyValue("--hx-positive").trim() || "#14A673";
    const neg = styles.getPropertyValue("--hx-negative").trim() || "#E5484D";
    setStroke(up ? pos : neg);
  }, [up]);

  return (
    <div className={cn("inline-block", className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Line
            type="monotone"
            dataKey="price"
            stroke={stroke}
            strokeWidth={1.25}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
