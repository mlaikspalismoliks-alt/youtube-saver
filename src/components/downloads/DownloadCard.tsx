"use client";

import * as React from "react";
import Image from "next/image";
import {
  Download,
  Trash2,
  RotateCcw,
  Film,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  XCircle,
} from "lucide-react";
import { DownloadItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { formatBytes, triggerMediaDownload } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface DownloadCardProps {
  item: DownloadItem;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function DownloadCard({
  item,
  onDelete,
  onRetry,
  onCancel,
}: DownloadCardProps) {
  const { showToast } = useToast();
  const [imageError, setImageError] = React.useState(false);

  const getStatusBadge = () => {
    switch (item.status) {
      case "downloading":
        return <Badge variant="accent" size="sm">Downloading</Badge>;
      case "completed":
        return <Badge variant="success" size="sm">Completed</Badge>;
      case "failed":
        return <Badge variant="error" size="sm">Failed</Badge>;
      case "cancelled":
        return <Badge variant="neutral" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{item.status}</Badge>;
    }
  };

  const handleDownloadFile = async () => {
    showToast(`Downloading file: ${item.title.substring(0, 24)}...`, "info");
    if (item.id && item.id.startsWith("dl-")) {
      const link = document.createElement("a");
      link.href = `/api/downloads/${item.id}/file`;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Finished saving ${item.title.substring(0, 24)}.${item.format.toLowerCase()}`, "success");
    } else {
      await triggerMediaDownload(item.title, item.format);
      showToast(`Finished saving ${item.title.substring(0, 24)}.${item.format.toLowerCase()}`, "success");
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/90 backdrop-blur-xl hover:border-accent/40 p-4 transition-all duration-300 space-y-3.5 shadow-card hover:shadow-neon">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Thumbnail and Title */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-surface-elevated border border-white/10 shadow-sm shrink-0 group">
            {!imageError ? (
              <Image
                src={item.thumbnailUrl}
                alt={item.title}
                fill
                sizes="96px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-elevated text-accent">
                <Film className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-elevated text-text-muted border border-white/5 uppercase">
                {item.source}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white truncate">
              {item.title}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-text-secondary">
              <span className="text-accent font-semibold">{item.quality}</span>
              <span>•</span>
              <span className="text-white">{item.format}</span>
              {item.resolution && (
                <>
                  <span>•</span>
                  <span className="text-text-muted">{item.resolution}</span>
                </>
              )}
              <span>•</span>
              <span className="text-text-muted">{item.size}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons based on status */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {item.status === "completed" && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadFile}
                className="gap-1.5 text-xs h-8 font-bold px-3 shadow-neon"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item.id)}
                className="text-text-muted hover:text-accent h-8 px-2"
                aria-label="Delete download"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}

          {item.status === "failed" && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onRetry(item.id)}
                className="gap-1.5 text-xs h-8 text-text-primary"
              >
                <RotateCcw className="h-3.5 w-3.5 text-accent" />
                <span>Retry</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item.id)}
                className="text-text-muted hover:text-error h-8 px-2"
                aria-label="Delete record"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}

          {item.status === "downloading" && onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(item.id)}
              className="gap-1.5 text-xs h-8 text-text-secondary hover:text-error hover:border-error/40"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </Button>
          )}

          {item.status === "cancelled" && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onRetry(item.id)}
                className="gap-1.5 text-xs h-8 text-text-primary"
              >
                <RotateCcw className="h-3.5 w-3.5 text-accent" />
                <span>Retry</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item.id)}
                className="text-text-muted hover:text-error h-8 px-2"
                aria-label="Delete download"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Downloading Active Progress Section */}
      {item.status === "downloading" && (
        <div className="space-y-1.5 pt-2 border-t border-border-subtle">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-text-secondary">
              <Activity className="h-3 w-3 text-accent animate-pulse" />
              <span>{item.progress.downloadSpeed}</span>
              <span>·</span>
              <span>{formatBytes(item.progress.downloadedBytes)} / {formatBytes(item.progress.totalBytes)}</span>
            </div>
            <span className="font-bold text-accent">
              {item.progress.percentage}%
            </span>
          </div>
          <Progress value={item.progress.percentage} animated />
        </div>
      )}

      {/* Error message detail if failed */}
      {item.status === "failed" && item.error && (
        <div className="text-xs text-error/90 bg-error/10 border border-error/20 p-2.5 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{item.error}</span>
        </div>
      )}
    </div>
  );
}
