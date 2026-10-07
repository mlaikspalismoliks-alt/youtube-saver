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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Workspace Title & Description */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated border border-border text-[11px] font-mono text-text-secondary mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span>YouTube Workspace Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Download YouTube media
          </h1>
          <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
            Process, extract, and download YouTube video and audio content from your private workspace.
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
