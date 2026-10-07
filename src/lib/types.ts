export type MediaSource = "YouTube" | "Vimeo" | "Internal Cloud" | "Direct URL";

export type DownloadStatus = 
  | "idle" 
  | "analyzing" 
  | "ready" 
  | "downloading" 
  | "completed" 
  | "failed" 
  | "cancelled";

export type MediaType = "video" | "audio";

export interface MediaFormat {
  id: string;
  type: MediaType;
  label: string; // e.g. "1080p", "720p", "Audio"
  container: string; // e.g. "MP4", "MP3"
  resolution?: string; // e.g. "1920 × 1080"
  bitrate?: string; // e.g. "320 kbps"
  estimatedSize: string; // e.g. "~168 MB"
  approxBytes: number;
  codec: string;
  isPopular?: boolean;
}

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  duration: string; // "12:43"
  durationSeconds: number;
  source: MediaSource;
  author: string;
  authorHandle?: string;
  uploadedDate: string; // "Sep 18, 2026"
  thumbnailUrl: string;
  aspectRatio?: string;
  viewCount?: string;
  availableFormats: MediaFormat[];
  description?: string;
}

export interface DownloadProgressState {
  percentage: number;
  downloadedBytes: number;
  totalBytes: number;
  downloadSpeed: string; // e.g. "18.4 MB/s"
  timeRemaining: string; // e.g. "2 minutes remaining"
  etaSeconds: number;
}

export interface DownloadItem {
  id: string;
  mediaId: string;
  title: string;
  thumbnailUrl: string;
  source: MediaSource;
  format: string; // "MP4" | "MP3"
  quality: string; // "1080p", "320 kbps"
  resolution?: string;
  size: string; // "168 MB"
  status: DownloadStatus;
  progress: DownloadProgressState;
  createdAt: string;
  completedAt?: string;
  error?: string;
  filePath?: string;
}

export interface HistoryItem {
  id: string;
  mediaId: string;
  title: string;
  source: MediaSource;
  format: string;
  quality: string;
  size: string;
  date: string;
  timestamp: number;
  status: "completed" | "failed" | "cancelled";
  thumbnailUrl: string;
  duration: string;
}

export interface WorkspaceSettings {
  defaultFormat: "MP4" | "MP3" | "WEBM";
  defaultQuality: "1080p" | "720p" | "480p" | "320kbps";
  autoSaveDownloads: boolean;
  appearance: "dark";
  compactMode: boolean;
  storageUsedBytes: number;
  storageMaxBytes: number;
}

export type HistoryFilterType = "all" | "completed" | "failed";
export type HistorySortType = "newest" | "oldest";

export type DownloadFilterTab = "all" | "active" | "completed" | "failed";

// Backend API DTOs (simulated contracts for future REST endpoints)
export interface AnalyzeMediaRequest {
  url: string;
}

export interface AnalyzeMediaResponse {
  success: boolean;
  data?: MediaItem;
  error?: {
    code: "UNSUPPORTED_URL" | "RATE_LIMITED" | "NETWORK_ERROR" | "GEO_RESTRICTED" | "UNKNOWN";
    message: string;
  };
}

export interface CreateDownloadRequest {
  mediaId: string;
  formatId: string;
  url: string;
}

export interface CreateDownloadResponse {
  success: boolean;
  downloadId: string;
  status: DownloadStatus;
  job: DownloadItem;
}

export interface CancelDownloadResponse {
  success: boolean;
  downloadId: string;
  status: "cancelled";
}
