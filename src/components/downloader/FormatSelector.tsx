"use client";

import * as React from "react";
import { MediaFormat } from "@/lib/types";
import { MonitorPlay, Music, Check, Film, HardDrive, Download, X } from "lucide-react";
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
      <div>
        <h3 className="text-base font-semibold text-text-primary tracking-tight">
          Download format
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          Choose the quality and format you need.
        </p>
      </div>

      {/* Selectable Format Cards Grid (Vertical list on mobile, grid on tablet & desktop) */}
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
                "relative text-left p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between group",
                isSelected
                  ? "bg-accent/10 border-accent text-text-primary shadow-subtle ring-1 ring-accent"
                  : "bg-surface hover:bg-surface-elevated border-border text-text-secondary hover:border-border-focus/50"
              )}
            >
              {/* Top row */}
              <div className="flex items-start justify-between w-full mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "p-2 rounded-lg border transition-colors",
                      isSelected
                        ? "bg-accent/20 border-accent/40 text-accent"
                        : "bg-surface-elevated border-border text-text-muted group-hover:text-text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-text-primary tracking-tight block">
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
                      ? "border-accent bg-accent text-white"
                      : "border-border-focus/40 bg-surface-elevated text-transparent"
                  )}
                >
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
              </div>

              {/* Bottom specs */}
              <div className="space-y-1 pt-2 border-t border-border-subtle w-full">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-text-muted">Spec:</span>
                  <span className="text-text-secondary font-medium">
                    {fmt.resolution || fmt.bitrate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-text-muted">Size:</span>
                  <span className="text-text-primary font-semibold">
                    {fmt.estimatedSize}
                  </span>
                </div>
              </div>

              {fmt.isPopular && (
                <div className="absolute -top-2 right-3">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-accent text-white font-semibold shadow">
                    Recommended
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Buttons: Primary Download & Cancel */}
      <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onDownload}
          className="w-full sm:w-auto gap-2"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>
      </div>
    </div>
  );
}
