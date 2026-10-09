"use client";

import * as React from "react";
import { MediaFormat } from "@/lib/types";
import { MonitorPlay, Music, Check, Film, HardDrive, Download, X, Play, Zap, Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FormatSelectorProps {
  formats: MediaFormat[];
  selectedFormatId: string;
  onSelectFormat: (formatId: string) => void;
  onDownload: () => void;
  onCancel: () => void;
}

export function FormatSelector({
  formats,
  selectedFormatId,
  onSelectFormat,
  onDownload,
  onCancel,
}: FormatSelectorProps) {
  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span>Select Payload Format</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5 font-mono">
            Direct YouTube stream muxing & extraction
          </p>
        </div>
        <span className="text-[11px] font-mono text-accent/80 border border-accent/30 bg-accent/10 px-2 py-0.5 rounded-md">
          HARDWARE ACCELERATED
        </span>
      </div>

      {/* Selectable Format Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {formats.map((fmt) => {
          const isSelected = fmt.id === selectedFormatId;
          const isAudio = fmt.type === "audio";
          const Icon = isAudio ? Music : MonitorPlay;

          return (
            <button
              key={fmt.id}
              type="button"
              onClick={() => onSelectFormat(fmt.id)}
              className={cn(
                "relative text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between group",
                isSelected
                  ? "bg-accent/15 border-accent text-white shadow-neon ring-1 ring-accent"
                  : "bg-surface/80 hover:bg-surface-elevated border-white/10 text-text-secondary hover:border-accent/40"
              )}
            >
              {/* Top row */}
              <div className="flex items-start justify-between w-full mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "p-2 rounded-lg border transition-colors",
                      isSelected
                        ? "bg-accent text-white border-accent shadow-neon"
                        : "bg-surface-elevated border-white/10 text-accent group-hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-white tracking-tight block">
                      {fmt.label}
                    </span>
                    <span className="text-[11px] font-mono text-text-muted">
                      {fmt.container}
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center transition-all",
                    isSelected
                      ? "border-accent bg-accent text-white shadow-neon"
                      : "border-white/20 bg-surface-elevated text-transparent"
                  )}
                >
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
              </div>

              {/* Audio animated frequency indicator if audio */}
              {isAudio && isSelected && (
                <div className="flex items-center gap-1 mb-2">
                  <span className="h-2 w-0.5 bg-accent animate-pulse" />
                  <span className="h-3 w-0.5 bg-accent animate-pulse delay-75" />
                  <span className="h-4 w-0.5 bg-accent animate-pulse delay-150" />
                  <span className="h-2.5 w-0.5 bg-accent animate-pulse delay-100" />
                  <span className="h-1.5 w-0.5 bg-accent animate-pulse" />
                  <span className="text-[9px] font-mono text-accent ml-1 font-bold">HQ AUDIO</span>
                </div>
              )}

              {/* Bottom specs */}
              <div className="space-y-1 pt-2 border-t border-white/10 w-full">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-text-muted">Stream:</span>
                  <span className="text-text-secondary font-medium">
                    {fmt.resolution || fmt.bitrate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-text-muted">Est. Size:</span>
                  <span className={cn("font-bold", isSelected ? "text-accent" : "text-white")}>
                    {fmt.estimatedSize}
                  </span>
                </div>
              </div>

              {fmt.isPopular && (
                <div className="absolute -top-2 right-3">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-accent text-white font-extrabold shadow-neon">
                    POPULAR 1080P
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Buttons: Primary Download & Cancel */}
      <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-white/5">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
          className="w-full sm:w-auto font-mono text-xs border-white/10 text-text-secondary hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onDownload}
          className="w-full sm:w-auto gap-2 font-black tracking-wider uppercase text-xs py-3 px-8 rounded-xl shadow-neon hover:shadow-neon-lg bg-gradient-to-r from-red-600 via-accent to-rose-600"
        >
          <Zap className="h-4 w-4 fill-current" />
          <span>Start Download Now</span>
        </Button>
      </div>
    </div>
  );
}
