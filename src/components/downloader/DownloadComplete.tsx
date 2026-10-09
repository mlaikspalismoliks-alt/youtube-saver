"use client";

import * as React from "react";
import { CheckCircle2, Download, RefreshCw, FolderCheck, Sparkles, Zap, HardDrive } from "lucide-react";
import { MediaItem, MediaFormat } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useWorkspace } from "@/context/WorkspaceContext";
import { triggerMediaDownload } from "@/lib/utils";

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

  const handleDownloadFile = async () => {
    if (activeJob?.id && activeJob.id.startsWith("dl-")) {
      // Stream the real file from the backend
      const link = document.createElement("a");
      link.href = `/api/downloads/${activeJob.id}/file`;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Downloading video file to your device...", "success");
    } else {
      await triggerMediaDownload(media.title, format.container);
      showToast("Downloading video file to your device...", "success");
    }
  };

  return (
    <div className="w-full rounded-2xl border border-emerald-500/30 bg-surface/90 backdrop-blur-2xl p-6 shadow-card space-y-6 animate-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Stream Processing Complete</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold">
                100% READY
              </span>
            </h3>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              Demuxed and formatted. Ready to save directly to local storage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
          <FolderCheck className="h-3.5 w-3.5" />
          <span>PAYLOAD PACKED</span>
        </div>
      </div>

      {/* Media Details Summary Box */}
      <div className="p-4 rounded-xl bg-surface-elevated/90 border border-white/10 space-y-2.5">
        <h4 className="text-sm font-bold text-white">
          {media.title}
        </h4>
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-text-secondary">
          <span className="px-2 py-0.5 rounded bg-accent/20 border border-accent/40 text-accent font-bold">
            {format.label}
          </span>
          <span>•</span>
          <span className="text-white font-medium">{format.container}</span>
          <span>•</span>
          <span className="text-white font-medium">{format.estimatedSize?.replace("~", "")}</span>
          {format.resolution && (
            <>
              <span>•</span>
              <span className="text-text-muted">{format.resolution}</span>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-white/10">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onProcessAnother}
          className="w-full sm:w-auto gap-2 font-mono text-xs border-white/10 text-text-secondary hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Process Another Video</span>
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleDownloadFile}
          className="w-full sm:w-auto gap-2 font-black tracking-wider uppercase text-xs py-3 px-8 rounded-xl shadow-neon hover:shadow-neon-lg bg-gradient-to-r from-red-600 via-accent to-rose-600"
        >
          <Download className="h-4 w-4" />
          <span>Save File to Device</span>
        </Button>
      </div>
    </div>
  );
}
