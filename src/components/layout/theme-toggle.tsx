"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "@/components/layout/theme-provider";

export function ThemeToggle({
  className,
  variant = "switch",
}: {
  className?: string;
  variant?: "switch" | "icon" | "segmented";
}) {
  const { theme, setTheme, toggleTheme, ready } = useTheme();

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className={cn("hx-icon-btn inline-flex", className)}
      >
        {theme === "dark" ? (
          <Sun className="size-4" aria-hidden />
        ) : (
          <Moon className="size-4" aria-hidden />
        )}
      </button>
    );
  }

  if (variant === "segmented") {
    const options: { id: Theme; label: string; icon: React.ReactNode }[] = [
      { id: "light", label: "Light", icon: <Sun className="size-3.5" aria-hidden /> },
      { id: "dark", label: "Dark", icon: <Moon className="size-3.5" aria-hidden /> },
    ];

    return (
      <div
        className={cn(
          "inline-flex items-center gap-0.5 rounded-[9px] border border-hx-border bg-hx-bg p-0.5",
          className,
        )}
        role="group"
        aria-label="Theme"
      >
        {options.map((opt) => {
          const active = ready ? theme === opt.id : opt.id === "light";
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-[7px] px-2.5 text-xs font-medium transition-colors",
                active
                  ? "bg-hx-card text-hx-text shadow-[0_1px_0_rgba(17,18,23,0.04)] dark:shadow-none"
                  : "text-hx-secondary hover:text-hx-text",
              )}
              aria-pressed={active}
            >
              {opt.icon}
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-[9px] border border-hx-border bg-hx-bg px-3 text-xs font-medium text-hx-secondary transition-colors hover:text-hx-text",
        className,
      )}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="size-3.5" aria-hidden />
      ) : (
        <Moon className="size-3.5" aria-hidden />
      )}
      <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
