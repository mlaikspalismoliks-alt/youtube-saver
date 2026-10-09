"use client";

import * as React from "react";
import { DownloadProgressState, MediaItem, MediaFormat } from "@/lib/types";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { X, ArrowDown, Activity, Clock, Zap, Cpu } from "lucide-react";
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
    <div className="w-full rounded-2xl border border-accent/40 bg-surface/90 backdrop-blur-2xl p-5 sm:p-6 shadow-neon space-y-5 animate-in fade-in duration-200">
      {/* Header status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-accent text-white shadow-neon flex items-center justify-center">
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                STREAMING PAYLOAD
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/40 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                QUANTUM EXTRACTION
              </span>
            </div>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              Demuxing audio/video streams in high-speed cloud container...
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="text-xs font-mono border-white/10 text-text-muted hover:text-accent hover:border-accent/40 h-8 gap-1.5"
        >
          <X className="h-3.5 w-3.5" />
          <span>Abort</span>
        </Button>
      </div>

      {/* Target Media Info Card */}
      <div className="p-4 rounded-xl bg-surface-elevated/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-white truncate">
            {media.title}
          </h4>
          <span className="text-xs font-mono text-text-secondary flex items-center gap-2 mt-1">
            <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent font-bold">
              {format.label}
            </span>
            <span>•</span>
            <span>{format.container}</span>
            {format.resolution && (
              <>
                <span>•</span>
                <span className="text-text-muted">{format.resolution}</span>
              </>
            )}
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">
            {progress.percentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar & Telemetry */}
      <div className="space-y-3">
        <Progress value={progress.percentage} animated />
        
        {/* Progress Metrics Row */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-text-secondary pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-bold">{formatBytes(progress.downloadedBytes)}</span>
            <span className="text-text-muted">/</span>
            <span>{formatBytes(progress.totalBytes)}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-accent font-bold">
              <Zap className="h-3.5 w-3.5" />
              <span>{progress.downloadSpeed}</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted">
              <Clock className="h-3.5 w-3.5" />
              <span>{progress.timeRemaining}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
