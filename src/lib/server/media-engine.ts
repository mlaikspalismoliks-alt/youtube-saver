import { spawn, ChildProcess, execSync } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import { MediaItem, MediaFormat } from "@/lib/types";

// Detect correct python binary: "python3" on Linux/Mac, "python" on Windows
const PYTHON_CMD = (() => {
  if (os.platform() === "win32") return "python";
  try {
    execSync("python3 --version", { stdio: "ignore" });
    return "python3";
  } catch {
    return "python";
  }
})();

// Locate static ffmpeg binary installed in node_modules
let ffmpegBinaryPath = "";
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ffmpegStatic = require("ffmpeg-static");
  ffmpegBinaryPath = typeof ffmpegStatic === "string" ? ffmpegStatic : "";
} catch {
  ffmpegBinaryPath = "";
}

// Storage directory for downloaded files
const STORAGE_DIR = path.join(process.cwd(), "media_storage");
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export { STORAGE_DIR };

/**
 * Validates that a URL is strictly from YouTube
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  const ytRegex = /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com\/(watch\?|shorts\/|live\/|embed\/|v\/)|youtu\.be\/)/i;
  return ytRegex.test(trimmed);
}

/**
 * Extracts full metadata without downloading
 * Enforced exclusively for YouTube URLs
 */
export async function extractMediaInfo(url: string): Promise<MediaItem> {
  if (!isYouTubeUrl(url)) {
    throw new Error("Only YouTube URLs are supported (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...).");
  }

  return new Promise((resolve, reject) => {
    const args = [
      "-m",
      "yt_dlp",
      "--dump-single-json",
      "--no-warnings",
      "--no-playlist",
      "--no-check-certificates",
    ];

    if (ffmpegBinaryPath) {
      args.push("--ffmpeg-location", ffmpegBinaryPath);
    }

    args.push(url.trim());

    const py = spawn(PYTHON_CMD, args);

    let stdoutData = "";
    let stderrData = "";

    py.stdout.on("data", (chunk: Buffer) => {
      stdoutData += chunk.toString();
    });

    py.stderr.on("data", (chunk: Buffer) => {
      stderrData += chunk.toString();
    });

    py.on("close", (code) => {
      if (code !== 0 || !stdoutData) {
        return reject(
          new Error(stderrData || "Failed to extract media information from URL.")
        );
      }

      try {
        const raw = JSON.parse(stdoutData);

        const durationSec = raw.duration || 0;
        const mins = Math.floor(durationSec / 60);
        const secs = durationSec % 60;
        const durationFormatted = `${mins}:${secs.toString().padStart(2, "0")}`;

        // Build formats list based on available resolutions
        const formats: MediaFormat[] = [
          {
            id: "fmt-1080p-mp4",
            type: "video",
            label: "1080p",
            container: "MP4",
            resolution: "1920 × 1080",
            estimatedSize: durationSec > 0 ? `~${Math.round((durationSec * 2.2))} MB` : "~168 MB",
            approxBytes: durationSec > 0 ? durationSec * 2.2 * 1024 * 1024 : 176160768,
            codec: "H.264 / AAC",
            isPopular: true,
          },
          {
            id: "fmt-720p-mp4",
            type: "video",
            label: "720p",
            container: "MP4",
            resolution: "1280 × 720",
            estimatedSize: durationSec > 0 ? `~${Math.round((durationSec * 1.1))} MB` : "~86 MB",
            approxBytes: durationSec > 0 ? durationSec * 1.1 * 1024 * 1024 : 90177536,
            codec: "H.264 / AAC",
          },
          {
            id: "fmt-480p-mp4",
            type: "video",
            label: "480p",
            container: "MP4",
            resolution: "854 × 480",
            estimatedSize: durationSec > 0 ? `~${Math.round((durationSec * 0.6))} MB` : "~42 MB",
            approxBytes: durationSec > 0 ? durationSec * 0.6 * 1024 * 1024 : 44040192,
            codec: "H.264 / AAC",
          },
          {
            id: "fmt-audio-mp3",
            type: "audio",
            label: "Audio",
            container: "MP3",
            bitrate: "320 kbps",
            estimatedSize: durationSec > 0 ? `~${Math.round((durationSec * 0.04 * 8))} MB` : "~28.5 MB",
            approxBytes: durationSec > 0 ? durationSec * 0.04 * 8 * 1024 * 1024 : 29884416,
            codec: "MP3 Stereo",
          },
        ];

        // Format uploaded date
        let uploadDateStr = "Recent";
        if (raw.upload_date && raw.upload_date.length === 8) {
          const y = raw.upload_date.substring(0, 4);
          const m = raw.upload_date.substring(4, 6);
          const d = raw.upload_date.substring(6, 8);
          uploadDateStr = `${y}-${m}-${d}`;
        }

        const item: MediaItem = {
          id: raw.id || `media-${Date.now()}`,
          url,
          title: raw.title || "Untitled Media",
          duration: durationFormatted,
          durationSeconds: durationSec,
          source: raw.extractor_key || "YouTube",
          author: raw.uploader || raw.channel || "Unknown Creator",
          authorHandle: raw.uploader_id ? `@${raw.uploader_id}` : undefined,
          uploadedDate: uploadDateStr,
          thumbnailUrl: raw.thumbnail || "",
          aspectRatio: "16:9",
          viewCount: raw.view_count ? `${raw.view_count.toLocaleString()} views` : undefined,
          availableFormats: formats,
          description: raw.description ? raw.description.substring(0, 300) : undefined,
        };

        resolve(item);
      } catch (err: any) {
        reject(new Error(`Failed to parse media metadata: ${err.message}`));
      }
    });
  });
}

/**
 * Spawns the real yt-dlp download process with live progress parsing
 */
export function startMediaDownload(
  jobId: string,
  url: string,
  formatId: string,
  onProgress: (pct: number, speed: string, eta: string) => void,
  onComplete: (filePath: string) => void,
  onError: (err: string) => void
): ChildProcess {
  if (!isYouTubeUrl(url)) {
    throw new Error("Only YouTube URLs are permitted for download.");
  }

  const isAudio = formatId.includes("audio");
  const ext = isAudio ? "mp3" : "mp4";
  const outputTemplate = path.join(STORAGE_DIR, `${jobId}.%(ext)s`);

  const args = [
    "-m",
    "yt_dlp",
    "--newline",
    "--no-warnings",
    "--no-check-certificates",
  ];

  if (ffmpegBinaryPath) {
    args.push("--ffmpeg-location", ffmpegBinaryPath);
  }

  if (isAudio) {
    args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
  } else {
    if (formatId.includes("1080p")) {
      args.push(
        "-f",
        "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best",
        "--merge-output-format",
        "mp4"
      );
    } else if (formatId.includes("720p")) {
      args.push(
        "-f",
        "bestvideo[height<=720]+bestaudio/best[height<=720]/best",
        "--merge-output-format",
        "mp4"
      );
    } else if (formatId.includes("480p")) {
      args.push(
        "-f",
        "bestvideo[height<=480]+bestaudio/best[height<=480]/best",
        "--merge-output-format",
        "mp4"
      );
    } else {
      args.push("-f", "bestvideo+bestaudio/best", "--merge-output-format", "mp4");
    }
  }

  args.push("-o", outputTemplate, url.trim());

  const py = spawn(PYTHON_CMD, args);

  let stderrOutput = "";

  py.stdout.on("data", (chunk: Buffer) => {
    const text = chunk.toString();

    // Regex match yt-dlp progress output
    // Example: [download]  42.5% of ~ 85.34MiB at  12.43MiB/s ETA 00:04
    const match = text.match(/\[download\]\s+([\d.]+)%\s+of\s+~?([^\s]+)\s+at\s+([^\s]+)\s+ETA\s+([^\s]+)/i);
    if (match) {
      const pct = parseFloat(match[1]);
      const speed = match[3];
      const eta = match[4];
      onProgress(pct, speed, eta);
    }
  });

  py.stderr.on("data", (chunk: Buffer) => {
    stderrOutput += chunk.toString();
  });

  py.on("close", (code) => {
    if (code === 0) {
      const finalFile = path.join(STORAGE_DIR, `${jobId}.${ext}`);
      onComplete(finalFile);
    } else {
      onError(stderrOutput || `Download failed with exit code ${code}`);
    }
  });

  return py;
}
