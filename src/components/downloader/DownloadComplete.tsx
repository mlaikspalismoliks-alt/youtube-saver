"use client";

import * as React from "react";
import { CheckCircle2, Download, RefreshCw, FolderCheck } from "lucide-react";
import { MediaItem, MediaFormat } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useWorkspace } from "@/context/WorkspaceContext";

interface DownloadCompleteProps {
  media: MediaItem;
  format: MediaFormat;
  onProcessAnother: () => void;
}

export function DownloadComplete({
  media,
  format,
  onProcessAnother,
}: DownloadCompleteProps) {
  const { showToast } = useToast();
  const { activeJob } = useWorkspace();

  const handleDownloadFile = () => {
    if (activeJob?.id) {
      // Stream the real file from the backend
      const link = document.createElement("a");
      link.href = `/api/downloads/${activeJob.id}/file`;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Downloading real video file to your device...", "success");
    } else {
      showToast("No download job found. Please try processing again.", "error");
    }
  };

  return (
    <div className="w-full rounded-xl border border-success/30 bg-surface p-6 shadow-card space-y-6 animate-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-success/15 border border-success/30 flex items-center justify-center text-success shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary tracking-tight">
              Download ready
            </h3>
            <p className="text-xs text-text-muted">
              Processing finished successfully. Your file is ready to save.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-md">
          <FolderCheck className="h-3.5 w-3.5" />
          <span>Ready to Save</span>
        </div>
      </div>

      {/* Media Details Summary Box */}
      <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
        <h4 className="text-sm font-semibold text-text-primary">
          {media.title}
        </h4>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-text-secondary">
          <span className="px-2 py-0.5 rounded bg-surface border border-border">
            {format.label}
          </span>
          <span>·</span>
          <span>{format.container}</span>
          <span>·</span>
          <span>{format.estimatedSize?.replace("~", "")}</span>
          {format.resolution && (
            <>
              <span>·</span>
              <span className="text-text-muted">{format.resolution}</span>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 border-t border-border-subtle">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onProcessAnother}
          className="w-full sm:w-auto gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Process another</span>
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleDownloadFile}
          className="w-full sm:w-auto gap-2 font-semibold"
        >
          <Download className="h-4 w-4" />
          <span>Download file</span>
        </Button>
      </div>
    </div>
  );
}
