"use client";

import * as React from "react";
import Image from "next/image";
import { HistoryItem } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Film, Trash2, Download, Clock } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

import { triggerMediaDownload } from "@/lib/utils";

interface HistoryCardProps {
  item: HistoryItem;
  onDelete: (id: string) => void;
}

export function HistoryCard({ item, onDelete }: HistoryCardProps) {
  const { showToast } = useToast();
  const [imageError, setImageError] = React.useState(false);

  const handleDownloadCopy = async () => {
    showToast(`Downloading ${item.format} file for ${item.title.substring(0, 20)}...`, "info");
    await triggerMediaDownload(item.title, item.format);
    showToast(`Finished saving ${item.title.substring(0, 20)}.${item.format.toLowerCase()}`, "success");
  };

  return (
    <div className="rounded-xl border border-border bg-surface hover:border-border-focus/40 p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle group">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Thumbnail */}
        <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-surface-elevated border border-border/80 shrink-0">
          {!imageError ? (
            <Image
              src={item.thumbnailUrl}
              alt={item.title}
              fill
              sizes="80px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-elevated text-text-muted">
              <Film className="h-5 w-5" />
            </div>
          )}
          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[10px] font-mono text-white">
            {item.duration}
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                item.status === "completed"
                  ? "success"
                  : item.status === "failed"
                  ? "error"
                  : "neutral"
              }
              size="sm"
            >
              {item.status === "completed" ? "Completed" : item.status === "failed" ? "Failed" : "Cancelled"}
            </Badge>
            <span className="text-[11px] font-mono text-text-muted">
              {item.source}
            </span>
            <span className="text-text-muted text-[10px]">·</span>
            <span className="text-[11px] text-text-muted">{item.date}</span>
          </div>

          <h4 className="text-sm font-semibold text-text-primary truncate">
            {item.title}
          </h4>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-text-secondary">
            <span>{item.quality}</span>
            <span>·</span>
            <span>{item.format}</span>
            <span>·</span>
            <span>{item.size}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {item.status === "completed" && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadCopy}
            className="text-xs h-8 gap-1.5"
          >
            <Download className="h-3.5 w-3.5 text-accent" />
            <span>Download</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
          className="text-text-muted hover:text-error h-8 px-2"
          aria-label="Delete history entry"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
