import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants = {
      primary:
        "bg-accent text-accent-foreground hover:bg-accent-hover shadow-subtle border border-accent/40 font-semibold",
      secondary:
        "bg-surface-elevated text-text-primary hover:bg-surface-hover border border-border hover:border-border-focus/40 shadow-subtle",
      outline:
        "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface border border-border hover:border-border-focus/50",
      ghost:
        "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface/80 border border-transparent",
      danger:
        "bg-error/15 text-error border border-error/30 hover:bg-error/25 hover:border-error/50",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-md gap-1.5 min-h-[32px]",
      md: "h-10 px-4 text-sm rounded-lg gap-2 min-h-[40px]",
      lg: "h-12 px-6 text-base rounded-lg gap-2.5 min-h-[48px]",
      icon: "h-10 w-10 p-0 rounded-lg shrink-0 min-h-[40px] min-w-[40px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
