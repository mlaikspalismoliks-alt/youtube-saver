"use client";

import * as React from "react";
import { DownloadProgressState, MediaItem, MediaFormat } from "@/lib/types";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { X, ArrowDown, Activity, Clock } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface DownloadProgressProps {
  media: MediaItem;
  format: MediaFormat;
  progress: DownloadProgressState;
  onCancel: () => void;
}

export function DownloadProgress({
  media,
  format,
  progress,
  onCancel,
}: DownloadProgressProps) {
  return (
    <div className="w-full rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-subtle space-y-5 animate-in fade-in duration-200">
      {/* Header status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">
                Downloading
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-accent border border-accent/20">
                Simulated Demo Job
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Processing through company media pipeline...
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="text-xs text-text-muted hover:text-error hover:border-error/40 h-8 gap-1.5"
        >
          <X className="h-3.5 w-3.5" />
          <span>Cancel download</span>
        </Button>
      </div>

      {/* Target Media Info */}
      <div className="p-3.5 rounded-lg bg-surface-elevated border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-text-primary truncate">
            {media.title}
          </h4>
          <span className="text-xs font-mono text-text-secondary">
            {format.label} · {format.container} {format.resolution ? `· ${format.resolution}` : ""}
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className="text-base font-mono font-bold text-accent">
            {progress.percentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress.percentage} animated />
        
        {/* Progress Metrics Row */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-text-secondary pt-1">
          <div className="flex items-center gap-1.5">
            <span>{formatBytes(progress.downloadedBytes)}</span>
            <span className="text-text-muted">/</span>
            <span>{formatBytes(progress.totalBytes)}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-text-muted">
              <Activity className="h-3 w-3 text-accent" />
              <span>{progress.downloadSpeed}</span>
            </div>
            <div className="flex items-center gap-1 text-text-muted">
              <Clock className="h-3 w-3" />
              <span>{progress.timeRemaining}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
