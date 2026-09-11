import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      hint,
      error,
      leftAddon,
      rightAddon,
      containerClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label ? (
          <label htmlFor={inputId} className="text-xs font-medium text-hx-secondary">
            {label}
          </label>
        ) : null}
        <div className="relative flex items-center">
          {leftAddon ? (
            <span className="pointer-events-none absolute left-3 text-xs text-hx-muted">
              {leftAddon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-9 w-full rounded-[9px] border border-hx-border bg-hx-card px-3 text-sm text-hx-text",
              "placeholder:text-hx-muted",
              "transition-colors outline-none",
              "focus:border-hx-primary focus:ring-2 focus:ring-hx-primary/20",
              "disabled:cursor-not-allowed disabled:bg-hx-bg disabled:opacity-60",
              leftAddon && "pl-9",
              rightAddon && "pr-9",
              error && "border-hx-negative focus:border-hx-negative focus:ring-hx-negative/20",
              className,
            )}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightAddon ? (
            <span className="absolute right-3 text-xs text-hx-muted">{rightAddon}</span>
          ) : null}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-hx-negative">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-hx-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
