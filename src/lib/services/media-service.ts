import {
  MediaItem,
  MediaFormat,
  DownloadItem,
  HistoryItem,
  AnalyzeMediaResponse,
  CreateDownloadResponse,
  CancelDownloadResponse,
} from "../types";
import { mockFormats, mockDownloads, mockHistory } from "../mock-data";

/**
 * MediaService — Talks to the real Next.js API backend (yt-dlp + ffmpeg).
 *
 * POST /api/media/analyze
 * POST /api/downloads
 * GET  /api/downloads/:id
 * POST /api/downloads/:id/cancel
 * GET  /api/downloads/:id/file
 * POST /api/storage/clear-temp
 */
class MediaService {
  private history: HistoryItem[] = [...mockHistory];

  async analyzeMedia(url: string): Promise<AnalyzeMediaResponse> {
    const res = await fetch("/api/media/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || {
          code: "UNSUPPORTED_URL",
          message: data.message || "Failed to analyze URL.",
        },
      };
    }
    return data;
  }

  async getFormats(_mediaId: string): Promise<MediaFormat[]> {
    return mockFormats;
  }

  async startDownload(media: MediaItem, format: MediaFormat): Promise<CreateDownloadResponse> {
    const res = await fetch("/api/downloads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media, format }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to start download.");
    }
    return data;
  }

  async getDownloadStatus(downloadId: string): Promise<DownloadItem | null> {
    try {
      const res = await fetch(`/api/downloads/${downloadId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.job || null;
    } catch {
      return null;
    }
  }

  async cancelDownload(downloadId: string): Promise<CancelDownloadResponse> {
    const res = await fetch(`/api/downloads/${downloadId}/cancel`, {
      method: "POST",
    });
    return res.json();
  }

  async getDownloads(): Promise<DownloadItem[]> {
    try {
      const res = await fetch("/api/downloads");
      const data = await res.json();
      if (data.downloads?.length > 0) return data.downloads;
    } catch {}
    return [...mockDownloads];
  }

  async deleteDownload(downloadId: string): Promise<boolean> {
    try {
      await fetch(`/api/downloads/${downloadId}`, { method: "DELETE" });
    } catch {}
    return true;
  }

  async getHistory(): Promise<HistoryItem[]> {
    return [...this.history];
  }

  async deleteHistoryItem(id: string): Promise<boolean> {
    this.history = this.history.filter((h) => h.id !== id);
    return true;
  }

  async clearTemporaryFiles(): Promise<{ freedBytes: number }> {
    try {
      const res = await fetch("/api/storage/clear-temp", { method: "POST" });
      const data = await res.json();
      return { freedBytes: data.freedBytes || 0 };
    } catch {
      return { freedBytes: 0 };
    }
  }
}

export const mediaService = new MediaService();
