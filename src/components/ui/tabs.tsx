"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
  listClassName?: string;
  size?: "sm" | "md";
}

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  className,
  listClassName,
  size = "sm",
}: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.id ?? "");
  const active = value ?? internal;

  function select(id: string) {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        role="tablist"
        className={cn(
          "inline-flex items-center gap-0.5 rounded-[9px] border border-hx-border bg-hx-bg p-0.5",
          listClassName,
        )}
      >
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={item.disabled}
              onClick={() => select(item.id)}
              className={cn(
                "rounded-[7px] font-medium text-hx-secondary transition-colors",
                "disabled:pointer-events-none disabled:opacity-40",
                size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-sm",
                isActive && "bg-hx-card text-hx-text shadow-[0_1px_0_rgba(17,18,23,0.04)]",
                !isActive && "hover:text-hx-text",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
