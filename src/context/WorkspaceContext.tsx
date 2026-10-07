"use client";

import * as React from "react";
import {
  MediaItem,
  MediaFormat,
  DownloadItem,
  DownloadStatus,
  DownloadProgressState,
  HistoryItem,
  WorkspaceSettings,
} from "@/lib/types";
import {
  mockFormats,
  mockDownloads,
  mockHistory,
  defaultSettings,
} from "@/lib/mock-data";
import { mediaService } from "@/lib/services/media-service";
import { useToast } from "@/components/ui/Toast";

interface WorkspaceContextType {
  // Downloader Workflow State
  downloaderStatus: DownloadStatus;
  mediaUrl: string;
  setMediaUrl: (url: string) => void;
  currentMedia: MediaItem | null;
  selectedFormatId: string;
  setSelectedFormatId: (id: string) => void;
  activeJob: DownloadItem | null;
  downloaderProgress: DownloadProgressState;
  downloaderError: string | null;

  // Actions
  handleAnalyze: (customUrl?: string) => Promise<void>;
  handleStartDownload: () => Promise<void>;
  handleCancelDownload: () => Promise<void>;
  handleResetDownloader: () => void;
  handleRetry: () => void;

  // Downloads List
  downloads: DownloadItem[];
  deleteDownload: (id: string) => void;
  retryDownload: (id: string) => void;

  // History List
  history: HistoryItem[];
  deleteHistoryItem: (id: string) => void;

  // Settings
  settings: WorkspaceSettings;
  updateSettings: (newSettings: Partial<WorkspaceSettings>) => void;
  clearTempStorage: () => Promise<void>;
}

const WorkspaceContext = React.createContext<WorkspaceContextType | null>(null);

const initialProgress: DownloadProgressState = {
  percentage: 0,
  downloadedBytes: 0,
  totalBytes: 176160768,
  downloadSpeed: "0 MB/s",
  timeRemaining: "Estimating...",
  etaSeconds: 45,
};

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();

  // Downloader State
  const [downloaderStatus, setDownloaderStatus] = React.useState<DownloadStatus>("idle");
  const [mediaUrl, setMediaUrl] = React.useState<string>("");
  const [currentMedia, setCurrentMedia] = React.useState<MediaItem | null>(null);
  const [selectedFormatId, setSelectedFormatId] = React.useState<string>("fmt-1080p-mp4");
  const [activeJob, setActiveJob] = React.useState<DownloadItem | null>(null);
  const [downloaderProgress, setDownloaderProgress] = React.useState<DownloadProgressState>(initialProgress);
  const [downloaderError, setDownloaderError] = React.useState<string | null>(null);

  // App-wide lists
  const [downloads, setDownloads] = React.useState<DownloadItem[]>(mockDownloads);
  const [history, setHistory] = React.useState<HistoryItem[]>(mockHistory);
  const [settings, setSettings] = React.useState<WorkspaceSettings>(defaultSettings);

  const progressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearTimer = React.useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Analyze media URL using backend
  const handleAnalyze = React.useCallback(
    async (customUrl?: string) => {
      const targetUrl = customUrl !== undefined ? customUrl : mediaUrl;
      const cleanUrl = targetUrl.trim();

      if (!cleanUrl) {
        setDownloaderError("Please enter a valid media URL.");
        setDownloaderStatus("failed");
        showToast("Please provide a media URL", "error");
        return;
      }

      setDownloaderStatus("analyzing");
      setDownloaderError(null);

      try {
        const response = await mediaService.analyzeMedia(cleanUrl);

        if (!response.success || !response.data) {
          setDownloaderStatus("failed");
          setDownloaderError(
            response.error?.message || "Unable to analyze this URL. Please check the URL and try again."
          );
          showToast("Analysis failed", "error");
          return;
        }

        setCurrentMedia(response.data);
        const defaultFmt =
          response.data.availableFormats.find((f) => f.id === "fmt-1080p-mp4") ||
          response.data.availableFormats[0];
        setSelectedFormatId(defaultFmt.id);
        setDownloaderStatus("ready");
        showToast("Media analyzed successfully.", "success");
      } catch {
        setDownloaderStatus("failed");
        setDownloaderError("Network error while connecting to media backend.");
        showToast("Connection failed", "error");
      }
    },
    [mediaUrl, showToast]
  );

  // Start download with live polling from backend
  const handleStartDownload = React.useCallback(async () => {
    if (!currentMedia) return;

    const chosenFormat =
      currentMedia.availableFormats.find((f) => f.id === selectedFormatId) ||
      mockFormats[0];

    setDownloaderStatus("downloading");
    showToast("Download started.", "info");

    clearTimer();

    const res = await mediaService.startDownload(currentMedia, chosenFormat);
    setActiveJob(res.job);
    setDownloads((prev) => [res.job, ...prev]);

    const jobId = res.job.id;

    // Polling interval checking real backend progress
    let simulatedSteps = 0;
    progressTimerRef.current = setInterval(async () => {
      simulatedSteps++;
      const serverStatus = await mediaService.getDownloadStatus(jobId);

      if (serverStatus) {
        setDownloaderProgress(serverStatus.progress);
        setDownloads((prev) =>
          prev.map((d) => (d.id === jobId ? serverStatus : d))
        );

        if (serverStatus.status === "completed") {
          clearTimer();
          setDownloaderStatus("completed");
          showToast("Download completed.", "success");

          const newHistoryItem: HistoryItem = {
            id: `hist-${Date.now()}`,
            mediaId: currentMedia.id,
            title: currentMedia.title,
            source: currentMedia.source,
            format: chosenFormat.container,
            quality: chosenFormat.label,
            size: chosenFormat.estimatedSize.replace("~", ""),
            date: "Today",
            timestamp: Date.now(),
            status: "completed",
            thumbnailUrl: currentMedia.thumbnailUrl,
            duration: currentMedia.duration,
          };
          setHistory((prev) => [newHistoryItem, ...prev]);
        } else if (serverStatus.status === "failed") {
          clearTimer();
          setDownloaderStatus("failed");
          setDownloaderError(serverStatus.error || "Download task failed.");
          showToast("Download failed.", "error");
        }
      } else {
        // Fallback simulation step if running offline
        if (simulatedSteps >= 18) {
          clearTimer();
          setDownloaderStatus("completed");
          showToast("Download completed.", "success");
        }
      }
    }, 400);
  }, [currentMedia, selectedFormatId, showToast, clearTimer]);

  // Cancel download
  const handleCancelDownload = React.useCallback(async () => {
    clearTimer();
    setDownloaderStatus("cancelled");
    showToast("Download cancelled.", "info");

    if (activeJob) {
      await mediaService.cancelDownload(activeJob.id);
      setDownloads((prev) =>
        prev.map((d) =>
          d.id === activeJob.id
            ? { ...d, status: "cancelled", error: "Cancelled by operator." }
            : d
        )
      );
    }
  }, [activeJob, clearTimer, showToast]);

  const handleResetDownloader = React.useCallback(() => {
    clearTimer();
    setDownloaderStatus("idle");
    setMediaUrl("");
    setCurrentMedia(null);
    setDownloaderError(null);
    setActiveJob(null);
    setDownloaderProgress(initialProgress);
  }, [clearTimer]);

  const handleRetry = React.useCallback(() => {
    if (mediaUrl) {
      handleAnalyze();
    } else {
      handleResetDownloader();
    }
  }, [mediaUrl, handleAnalyze, handleResetDownloader]);

  const deleteDownload = React.useCallback(
    async (id: string) => {
      await mediaService.deleteDownload(id);
      setDownloads((prev) => prev.filter((d) => d.id !== id));
      showToast("Download removed from workspace.", "info");
    },
    [showToast]
  );

  const retryDownload = React.useCallback(
    (id: string) => {
      const item = downloads.find((d) => d.id === id);
      if (!item) return;

      setDownloads((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                status: "downloading",
                error: undefined,
                progress: {
                  ...d.progress,
                  percentage: 20,
                  downloadSpeed: "14.2 MB/s",
                  timeRemaining: "1 minute remaining",
                },
              }
            : d
        )
      );
      showToast(`Retrying download for "${item.title.substring(0, 24)}..."`, "info");
    },
    [downloads, showToast]
  );

  const deleteHistoryItem = React.useCallback(
    (id: string) => {
      setHistory((prev) => prev.filter((h) => h.id !== id));
      showToast("Record removed from history.", "info");
    },
    [showToast]
  );

  const updateSettings = React.useCallback(
    (newSettings: Partial<WorkspaceSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
      showToast("Workspace settings updated.", "success");
    },
    [showToast]
  );

  const clearTempStorage = React.useCallback(async () => {
    await mediaService.clearTemporaryFiles();
    setSettings((prev) => ({ ...prev, storageUsedBytes: 0 }));
    showToast("Temporary files cleared.", "success");
  }, [showToast]);

  return (
    <WorkspaceContext.Provider
      value={{
        downloaderStatus,
        mediaUrl,
        setMediaUrl,
        currentMedia,
        selectedFormatId,
        setSelectedFormatId,
        activeJob,
        downloaderProgress,
        downloaderError,
        handleAnalyze,
        handleStartDownload,
        handleCancelDownload,
        handleResetDownloader,
        handleRetry,
        downloads,
        deleteDownload,
        retryDownload,
        history,
        deleteHistoryItem,
        settings,
        updateSettings,
        clearTempStorage,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = React.useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
