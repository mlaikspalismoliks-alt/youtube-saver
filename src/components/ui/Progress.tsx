import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  animated?: boolean;
}

export function Progress({ value, animated = true, className, ...props }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-surface-elevated border border-white/10 shadow-inner",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full bg-gradient-to-r from-red-600 via-accent to-rose-400 shadow-neon transition-all duration-300 ease-out rounded-full",
          animated && "relative overflow-hidden"
        )}
        style={{ width: `${clampedValue}%` }}
      >
        {animated && clampedValue > 0 && clampedValue < 100 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shimmer" />
        )}
      </div>
    </div>
  );
}
