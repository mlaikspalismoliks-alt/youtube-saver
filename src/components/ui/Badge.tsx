import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "neutral" | "accent" | "success" | "warning" | "error" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  ...props
}: BadgeProps) {
  const variants = {
    neutral: "bg-surface-elevated text-text-secondary border-border",
    accent: "bg-accent/15 text-accent border-accent/30",
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    error: "bg-error/15 text-error border-error/30",
    outline: "bg-transparent text-text-secondary border-border",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-medium leading-none rounded",
    md: "px-2.5 py-1 text-xs font-medium rounded-md",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 border font-mono tracking-tight select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
