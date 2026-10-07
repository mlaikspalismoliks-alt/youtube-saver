import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border rounded-xl bg-surface/40",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-elevated border border-border text-text-muted mb-4 shadow-subtle">
        <Icon className="h-6 w-6 stroke-[1.5]" />
      </div>
      <h4 className="text-base font-semibold text-text-primary tracking-tight">{title}</h4>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
