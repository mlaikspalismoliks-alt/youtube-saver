"use client";

import * as React from "react";
import { UrlInput } from "@/components/downloader/UrlInput";
import { AnalyzingSkeleton } from "@/components/downloader/AnalyzingSkeleton";
import { MediaPreview } from "@/components/downloader/MediaPreview";
import { FormatSelector } from "@/components/downloader/FormatSelector";
import { DownloadProgress } from "@/components/downloader/DownloadProgress";
import { DownloadComplete } from "@/components/downloader/DownloadComplete";
import { DownloadError } from "@/components/downloader/DownloadError";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ShieldCheck, Sparkles, AlertCircle } from "lucide-react";

export default function DownloaderPage() {
  const {
    downloaderStatus,
    currentMedia,
    selectedFormatId,
    setSelectedFormatId,
    downloaderProgress,
    downloaderError,
    handleStartDownload,
    handleCancelDownload,
    handleResetDownloader,
    handleRetry,
    handleAnalyze,
  } = useWorkspace();

  const selectedFormat =
    currentMedia?.availableFormats.find((f) => f.id === selectedFormatId) ||
    currentMedia?.availableFormats[0];

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Ambient Cyber Neon Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-accent/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Futuristic Cyber YouTube Title */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-[11px] font-mono text-accent shadow-neon mb-1">
            <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
            <span className="font-bold tracking-widest uppercase">YouTube Quantum Engine v2.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Download Any <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-400 filter drop-shadow">YouTube Media</span>
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl leading-relaxed">
            Ultra-fast high-definition video extraction & studio-grade 320kbps MP3 conversion powered by cloud stream processing.
          </p>
        </div>

        {/* Primary URL Input Bar (always visible or ready for new entry) */}
        {downloaderStatus !== "downloading" && downloaderStatus !== "completed" && (
          <div className="space-y-4">
            <UrlInput />
          </div>
        )}

        {/* State 1: Analyzing Loading State */}
        {downloaderStatus === "analyzing" && <AnalyzingSkeleton />}

        {/* State 2: Media Ready & Format Selection */}
        {downloaderStatus === "ready" && currentMedia && selectedFormat && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Preview Card */}
            <MediaPreview
              media={currentMedia}
              onChangeUrl={handleResetDownloader}
            />

            {/* Format Selector & Download Action */}
            <FormatSelector
              formats={currentMedia.availableFormats}
              selectedFormatId={selectedFormatId}
              onSelectFormat={setSelectedFormatId}
              onDownload={handleStartDownload}
              onCancel={handleResetDownloader}
            />
          </div>
        )}

        {/* State 3: Active Downloading Progress */}
        {downloaderStatus === "downloading" && currentMedia && selectedFormat && (
          <div className="space-y-6">
            <DownloadProgress
              media={currentMedia}
              format={selectedFormat}
              progress={downloaderProgress}
              onCancel={handleCancelDownload}
            />
          </div>
        )}

        {/* State 4: Download Completed Success */}
        {downloaderStatus === "completed" && currentMedia && selectedFormat && (
          <div className="space-y-6">
            <DownloadComplete
              media={currentMedia}
              format={selectedFormat}
              onProcessAnother={handleResetDownloader}
            />
          </div>
        )}

        {/* State 5: Failed State */}
        {downloaderStatus === "failed" && (
          <DownloadError
            title="Unable to analyze this URL"
            message={
              downloaderError ||
              "Please check the URL and try again. Make sure the media is authorized for internal indexing."
            }
            onRetry={handleRetry}
            onReset={handleResetDownloader}
          />
        )}

        {/* State 6: Cancelled State */}
        {downloaderStatus === "cancelled" && (
          <DownloadError
            isCancelled
            title="Download cancelled"
            message="The media download task was halted by the operator. No files were written to disk."
            onRetry={handleRetry}
            onReset={handleResetDownloader}
          />
        )}

        {/* Testing / QA State Switcher Panel for Reviewers */}
        <div className="pt-8 border-t border-border-subtle">
          <div className="p-4 rounded-xl bg-surface/50 border border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-text-primary block">
                Prototype State Inspector
              </span>
              <span className="text-text-muted">
                Test UI error and edge cases without waiting.
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleAnalyze("https://www.youtube.com/watch?v=error-simulation")}
                className="px-2.5 py-1 rounded bg-surface-elevated hover:bg-surface border border-border text-text-secondary text-[11px]"
              >
                Test Error State
              </button>
              <button
                type="button"
                onClick={() => handleAnalyze("https://www.youtube.com/watch?v=restricted-media")}
                className="px-2.5 py-1 rounded bg-surface-elevated hover:bg-surface border border-border text-text-secondary text-[11px]"
              >
                Test Restricted State
              </button>
              <button
                type="button"
                onClick={handleResetDownloader}
                className="px-2.5 py-1 rounded bg-surface-elevated hover:bg-surface border border-border text-text-secondary text-[11px]"
              >
                Reset to Idle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
