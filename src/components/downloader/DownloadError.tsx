"use client";

import * as React from "react";
import { AlertCircle, RotateCcw, AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DownloadErrorProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  onReset?: () => void;
  isCancelled?: boolean;
}

export function DownloadError({
  title = "Unable to analyze this URL",
  message = "Please check the URL and try again.",
  onRetry,
  onReset,
  isCancelled = false,
}: DownloadErrorProps) {
  const Icon = isCancelled ? AlertTriangle : AlertCircle;

  return (
    <div className="w-full rounded-xl border border-border bg-surface p-6 shadow-subtle space-y-4 animate-in fade-in duration-200">
      <div className="flex items-start gap-3.5">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isCancelled
              ? "bg-warning/15 border-warning/30 text-warning"
              : "bg-error/15 border-error/30 text-error"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-text-primary tracking-tight">
            {isCancelled ? "Download cancelled" : title}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed max-w-lg">
            {message}
          </p>
        </div>
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-2.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="gap-2 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{isCancelled ? "Start again" : "Try again"}</span>
        </Button>

        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-text-muted hover:text-text-primary"
          >
            Clear and reset
          </Button>
        )}
      </div>
    </div>
  );
}
