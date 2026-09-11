import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-raised disabled:opacity-50",
  secondary:
    "bg-hx-bg text-hx-text hover:bg-hx-border/40 disabled:opacity-50",
  ghost:
    "bg-transparent text-hx-secondary hover:bg-hx-bg hover:text-hx-text disabled:opacity-50",
  outline:
    "bg-hx-card text-hx-text border border-hx-border hover:bg-hx-bg disabled:opacity-50",
  danger:
    "bg-hx-negative text-white hover:opacity-90 disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-2.5 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-11 px-4 text-sm gap-2",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center font-medium rounded-[9px] transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hx-primary/35 focus-visible:ring-offset-1 focus-visible:ring-offset-hx-bg",
          "disabled:cursor-not-allowed disabled:pointer-events-none",
          variant === "primary" && "focus-visible:ring-0 focus-visible:ring-offset-0",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden /> : null}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
