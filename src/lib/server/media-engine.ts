import { spawn, ChildProcess, execSync, spawnSync } from "child_process";
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

// Storage directory for downloaded files
const STORAGE_DIR = path.join(process.cwd(), "media_storage");
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export { STORAGE_DIR };

/**
 * Resolves the path to YouTube cookies file if provided via environment or disk.
 */
export function getCookieFilePath(): string | null {
  // 1. Check if YOUTUBE_COOKIES or COOKIES_DATA environment variable is provided
  const envCookies =
    process.env.YOUTUBE_COOKIES ||
    process.env.COOKIES_DATA ||
    process.env.COOKIES_CONTENT;
  const envCookieFile = path.join(STORAGE_DIR, "cookies.txt");

  if (envCookies && envCookies.trim()) {
    try {
      let content = envCookies.trim();
      // Decode base64 if not plain text Netscape format
      if (!content.includes("\t") && !content.includes("# Netscape") && content.length > 50) {
        try {
          const decoded = Buffer.from(content, "base64").toString("utf-8");
          if (decoded.includes("youtube.com") || decoded.includes("# Netscape")) {
            content = decoded;
          }
        } catch {}
      }
      fs.writeFileSync(envCookieFile, content, "utf-8");
      return envCookieFile;
    } catch (e) {
      console.warn("Failed to write env cookies:", e);
    }
  }

  // 2. Check if cookies.txt file exists in known locations
  const candidatePaths = [
    path.join(STORAGE_DIR, "cookies.txt"),
    path.join(process.cwd(), "cookies.txt"),
    "/app/cookies.txt",
    path.join(os.tmpdir(), "youtube_cookies.txt"),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const stats = fs.statSync(p);
        if (stats.size > 10) return p;
      } catch {}
    }
  }

  return null;
}

/**
 * Translates raw yt-dlp error output into actionable, human-friendly guidance.
 */
export function cleanYtDlpError(errText: string): string {
  if (!errText) return "An unexpected error occurred while processing the media.";
  const lower = errText.toLowerCase();

  if (
    lower.includes("sign in to confirm you're not a bot") ||
    lower.includes("sign in to confirm you’re not a bot") ||
    lower.includes("use --cookies") ||
    lower.includes("bot detection")
  ) {
    return "YouTube Bot Verification Required: YouTube is blocking requests from this server's IP. Solutions: (1) Add your YouTube cookies in Settings or set the YOUTUBE_COOKIES environment variable, or (2) Deploy a PO Token provider server and set YT_DLP_POT_PROVIDER_URL in your environment. See Render dashboard > Environment settings.";
  }

  if (lower.includes("this video is unavailable")) {
    return "This YouTube video is unavailable or has been removed.";
  }

  if (lower.includes("private video")) {
    return "This video is private on YouTube and requires authentication.";
  }

  if (
    lower.includes("video unavailable in your country") ||
    lower.includes("not available in your country")
  ) {
    return "This video is geo-restricted and unavailable in the server's region.";
  }

  if (lower.includes("requested format is not available")) {
    return "The requested video resolution is not available for this stream. Please try another quality.";
  }

  const errorMatch = errText.match(/ERROR:\s*(\[youtube\]\s*[^:\n]+:\s*)?([^\n\r]+)/i);
  if (errorMatch && errorMatch[2]) {
    return errorMatch[2].trim();
  }

  return errText.slice(0, 300).trim();
}

/**
 * Returns command and base args for running yt-dlp (standalone binary or python module)
 */
function getYtDlpExecution(): { command: string; baseArgs: string[] } {
  const localBinary = path.join(process.cwd(), "yt-dlp");
  const localBinaryWin = path.join(process.cwd(), "yt-dlp.exe");

  const commonArgs = [
    "--no-check-certificates",
    "--no-warnings",
    "--retries",
    "5",
    "--fragment-retries",
    "5",
    "--js-runtimes",
    "node",
    "--remote-components",
    "ejs:github",
  ];

  // Rate-limit requests to avoid triggering YouTube's anti-bot throttling
  commonArgs.push(
    "--sleep-requests", "1",
    "--sleep-interval", "2",
    "--max-sleep-interval", "5"
  );

  // Pass master server cookies if configured on the server
  const cookiePath = getCookieFilePath();
  if (cookiePath) {
    commonArgs.push("--cookies", cookiePath);
    // When cookies are present, web client gives access to highest resolutions
    commonArgs.push(
      "--extractor-args",
      "youtube:player_client=web,android_vr,tv,web_embedded"
    );
  } else {
    // When no cookies are configured, avoid 'web' as primary client on datacenter IPs
    // (prevents "Sign in to confirm you're not a bot" challenge from blocking downloads)
    commonArgs.push(
      "--extractor-args",
      "youtube:player_client=tv,android_vr,web_embedded,mweb"
    );
  }

  // Support PO Token provider if a POT server URL is configured
  // This allows bypassing YouTube's BotGuard challenges from datacenter IPs
  const potProviderUrl = process.env.YT_DLP_POT_PROVIDER_URL;
  if (potProviderUrl && potProviderUrl.trim()) {
    commonArgs.push(
      "--extractor-args",
      `youtube:po_token_provider_url=${potProviderUrl.trim()}`
    );
  }

  // Pass proxy if configured in environment
  const proxy =
    process.env.YTDLP_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.HTTPS_PROXY;
  if (proxy && proxy.trim()) {
    commonArgs.push("--proxy", proxy.trim());
  }

  if (fs.existsSync(localBinaryWin)) {
    return { command: localBinaryWin, baseArgs: [...commonArgs] };
  }
  if (fs.existsSync(localBinary)) {
    return { command: localBinary, baseArgs: [...commonArgs] };
  }

  return { command: PYTHON_CMD, baseArgs: ["-m", "yt_dlp", ...commonArgs] };
}

/**
 * Resolves the ffmpeg executable across local development, Windows, Linux containers, and Docker.
 */
export function getFfmpegPath(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ffmpegStatic = require("ffmpeg-static");
    if (typeof ffmpegStatic === "string" && fs.existsSync(ffmpegStatic)) {
      return ffmpegStatic;
    }
  } catch {}

  const candidatePaths = [
    "/usr/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
    path.join(process.cwd(), "ffmpeg"),
    path.join(process.cwd(), "ffmpeg.exe"),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }

  try {
    const cmd = os.platform() === "win32" ? "where ffmpeg" : "which ffmpeg";
    const out = execSync(cmd, { stdio: ["pipe", "pipe", "ignore"] })
      .toString()
      .trim()
      .split(/[\r\n]+/)[0];
    if (out && fs.existsSync(out)) return out;
  } catch {}

  return "";
}

const ffmpegBinaryPath = getFfmpegPath();

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
 * Extracts YouTube video ID from various URL patterns
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i);
  return match ? match[1] : null;
}

/**
 * Extracts basic YouTube metadata instantly via YouTube oEmbed API
 */
async function fetchYouTubeOEmbed(url: string): Promise<{ title: string; author: string; thumbnail: string; videoId: string } | null> {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || "YouTube Video",
      author: data.author_name || "YouTube Creator",
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      videoId,
    };
  } catch {
    return null;
  }
}

/**
 * Extracts full metadata with resilient YouTube oEmbed and yt-dlp fallbacks
 */
export async function extractMediaInfo(url: string): Promise<MediaItem> {
  if (!isYouTubeUrl(url)) {
    throw new Error("Only YouTube URLs are supported (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...).");
  }

  // Pre-fetch oEmbed info in parallel for instantaneous resilient metadata
  const oembedPromise = fetchYouTubeOEmbed(url);

  return new Promise(async (resolve, reject) => {
    const oembedData = await oembedPromise;

    const { command, baseArgs } = getYtDlpExecution();
    const args = [
      ...baseArgs,
      "--dump-single-json",
      "--no-warnings",
      "--no-playlist",
      "--no-check-certificates",
    ];

    if (ffmpegBinaryPath) {
      args.push("--ffmpeg-location", ffmpegBinaryPath);
    }

    args.push(url.trim());

    const py = spawn(command, args);

    let stdoutData = "";
    let stderrData = "";

    py.stdout.on("data", (chunk: Buffer) => {
      stdoutData += chunk.toString();
    });

    py.stderr.on("data", (chunk: Buffer) => {
      stderrData += chunk.toString();
    });

    py.on("close", (code) => {
      // If yt-dlp failed or was blocked by bot check, recover immediately with oEmbed metadata
      if (code !== 0 || !stdoutData.trim()) {
        if (oembedData) {
          const defaultFormats: MediaFormat[] = [
            {
              id: "fmt-1080p-mp4",
              type: "video",
              label: "1080p",
              container: "MP4",
              resolution: "1920 × 1080",
              estimatedSize: "~120 MB",
              approxBytes: 125829120,
              codec: "H.264 / AAC",
              isPopular: true,
            },
            {
              id: "fmt-720p-mp4",
              type: "video",
              label: "720p",
              container: "MP4",
              resolution: "1280 × 720",
              estimatedSize: "~65 MB",
              approxBytes: 68157440,
              codec: "H.264 / AAC",
            },
            {
              id: "fmt-480p-mp4",
              type: "video",
              label: "480p",
              container: "MP4",
              resolution: "854 × 480",
              estimatedSize: "~35 MB",
              approxBytes: 36700160,
              codec: "H.264 / AAC",
            },
            {
              id: "fmt-audio-mp3",
              type: "audio",
              label: "Audio",
              container: "MP3",
              bitrate: "320 kbps",
              estimatedSize: "~8.5 MB",
              approxBytes: 8912896,
              codec: "MP3 Stereo",
            },
          ];

          return resolve({
            id: oembedData.videoId,
            url,
            title: oembedData.title,
            duration: "Stream",
            durationSeconds: 0,
            source: "YouTube",
            author: oembedData.author,
            uploadedDate: "Recent",
            thumbnailUrl: oembedData.thumbnail,
            aspectRatio: "16:9",
            availableFormats: defaultFormats,
          });
        }

        const videoId = extractYouTubeId(url);
        const cleanedErr = cleanYtDlpError(stderrData);
        if (
          videoId &&
          !stderrData.includes("This video is unavailable") &&
          !stderrData.includes("Private video")
        ) {
          const fallbackFormats: MediaFormat[] = [
            {
              id: "fmt-1080p-mp4",
              type: "video",
              label: "1080p",
              container: "MP4",
              resolution: "1920 × 1080",
              estimatedSize: "~120 MB",
              approxBytes: 125829120,
              codec: "H.264 / AAC",
              isPopular: true,
            },
            {
              id: "fmt-720p-mp4",
              type: "video",
              label: "720p",
              container: "MP4",
              resolution: "1280 × 720",
              estimatedSize: "~65 MB",
              approxBytes: 68157440,
              codec: "H.264 / AAC",
            },
            {
              id: "fmt-480p-mp4",
              type: "video",
              label: "480p",
              container: "MP4",
              resolution: "854 × 480",
              estimatedSize: "~35 MB",
              approxBytes: 36700160,
              codec: "H.264 / AAC",
            },
            {
              id: "fmt-audio-mp3",
              type: "audio",
              label: "Audio",
              container: "MP3",
              bitrate: "320 kbps",
              estimatedSize: "~8.5 MB",
              approxBytes: 8912896,
              codec: "MP3 Stereo",
            },
          ];

          return resolve({
            id: videoId,
            url,
            title: "YouTube Video",
            duration: "HQ Stream",
            durationSeconds: 0,
            source: "YouTube",
            author: "YouTube Creator",
            uploadedDate: "Recent",
            thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            aspectRatio: "16:9",
            availableFormats: fallbackFormats,
          });
        }

        return reject(
          new Error(cleanedErr || "Failed to extract media information from URL.")
        );
      }

      try {
        // Strip any unexpected non-JSON prefixes or warnings that might leak into stdout
        const trimmed = stdoutData.trim();
        const jsonStart = trimmed.indexOf("{");
        const jsonEnd = trimmed.lastIndexOf("}");
        if (jsonStart === -1 || jsonEnd === -1) {
          if (oembedData) {
            return resolve({
              id: oembedData.videoId,
              url,
              title: oembedData.title,
              duration: "Stream",
              durationSeconds: 0,
              source: "YouTube",
              author: oembedData.author,
              uploadedDate: "Recent",
              thumbnailUrl: oembedData.thumbnail,
              aspectRatio: "16:9",
              availableFormats: [
                {
                  id: "fmt-1080p-mp4",
                  type: "video",
                  label: "1080p",
                  container: "MP4",
                  resolution: "1920 × 1080",
                  estimatedSize: "~120 MB",
                  approxBytes: 125829120,
                  codec: "H.264 / AAC",
                  isPopular: true,
                },
                {
                  id: "fmt-720p-mp4",
                  type: "video",
                  label: "720p",
                  container: "MP4",
                  resolution: "1280 × 720",
                  estimatedSize: "~65 MB",
                  approxBytes: 68157440,
                  codec: "H.264 / AAC",
                },
                {
                  id: "fmt-audio-mp3",
                  type: "audio",
                  label: "Audio",
                  container: "MP3",
                  bitrate: "320 kbps",
                  estimatedSize: "~8.5 MB",
                  approxBytes: 8912896,
                  codec: "MP3 Stereo",
                },
              ],
            });
          }
          throw new Error("No valid JSON found in yt-dlp response.");
        }
        const jsonString = trimmed.substring(jsonStart, jsonEnd + 1);
        const raw = JSON.parse(jsonString);

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

  const isAudio = formatId.toLowerCase().includes("audio") || formatId.toLowerCase().includes("mp3");
  const ext = isAudio ? "mp3" : "mp4";
  const outputTemplate = path.join(STORAGE_DIR, `${jobId}.%(ext)s`);

  const { command, baseArgs } = getYtDlpExecution();
  const args = [
    ...baseArgs,
    "--newline",
    "--no-warnings",
    "--no-check-certificates",
  ];

  const ffmpeg = getFfmpegPath();
  if (ffmpeg) {
    args.push("--ffmpeg-location", ffmpeg);
  }

  if (isAudio) {
    args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
  } else {
    // Determine target resolution from formatId
    let targetHeight = 1080;
    if (formatId.includes("720p")) targetHeight = 720;
    else if (formatId.includes("480p")) targetHeight = 480;
    else if (formatId.includes("1080p")) targetHeight = 1080;

    // Prioritize standard H.264 video codec and AAC/m4a audio codec
    // This prevents YouTube from delivering AV1 or VP9 video streams
    // which cause default players (Windows Media Player, QuickTime, iOS, TV)
    // to play only audio and display a black screen.
    args.push(
      "-S",
      `vcodec:h264,res:${targetHeight},acodec:m4a`,
      "-f",
      `bestvideo[height<=${targetHeight}][vcodec^=avc]+bestaudio[acodec^=mp4a]/bestvideo[height<=${targetHeight}][vcodec^=avc]+bestaudio/bestvideo[height<=${targetHeight}]+bestaudio[acodec^=mp4a]/bestvideo[height<=${targetHeight}]+bestaudio/best[height<=${targetHeight}]/best`,
      "--merge-output-format",
      "mp4"
    );
  }

  args.push("-o", outputTemplate, url.trim());

  const py = spawn(command, args);

  let stderrOutput = "";

  py.stdout.on("data", (chunk: Buffer) => {
    const text = chunk.toString();

    // Regex match yt-dlp progress output
    // Example: [download]  42.5% of ~ 85.34MiB at  12.43MiB/s ETA 00:04
    const match = text.match(/\[download\]\s+([\d.]+)%\s+of\s+~?\s*([^\s]+)\s+at\s+([^\s]+)\s+ETA\s+([^\s]+)/i);
    if (match) {
      const pct = parseFloat(match[1]);
      const speed = match[3];
      const eta = match[4];
      onProgress(pct, speed, eta);
    } else {
      const simpleMatch = text.match(/\[download\]\s+([\d.]+)%/i);
      if (simpleMatch) {
        const pct = parseFloat(simpleMatch[1]);
        onProgress(pct, "Downloading...", "Calculating...");
      }
    }
  });

  py.stderr.on("data", (chunk: Buffer) => {
    stderrOutput += chunk.toString();
  });

  py.on("close", (code) => {
    if (code === 0) {
      let finalFile = path.join(STORAGE_DIR, `${jobId}.${ext}`);
      
      if (!fs.existsSync(finalFile)) {
        // Fallback: locate output file starting with jobId prefix
        const files = fs.readdirSync(STORAGE_DIR);
        // Exclude temporary or split format fragments (.f140, .part, .ytdl, etc.)
        const validFiles = files.filter(
          (f) =>
            f.startsWith(`${jobId}.`) &&
            !f.endsWith(".part") &&
            !f.endsWith(".ytdl") &&
            !f.endsWith(".temp") &&
            !f.includes(".f")
        );

        if (isAudio) {
          const audioMatch = validFiles.find((f) => f.endsWith(".mp3") || f.endsWith(".m4a") || f.endsWith(".aac"));
          if (audioMatch) finalFile = path.join(STORAGE_DIR, audioMatch);
        } else {
          const videoMatch = validFiles.find((f) => f.endsWith(".mp4") || f.endsWith(".mkv") || f.endsWith(".webm"));
          if (videoMatch) finalFile = path.join(STORAGE_DIR, videoMatch);
        }

        // Last resort fallback
        if (!fs.existsSync(finalFile) && validFiles.length > 0) {
          finalFile = path.join(STORAGE_DIR, validFiles[0]);
        }
      }

      if (!fs.existsSync(finalFile)) {
        onError("Download completed but media file could not be located on disk.");
        return;
      }

      // If user requested video, verify that the file actually contains a video track
      // and ensure codecs are compatible (H.264 + AAC)
      if (!isAudio && ffmpeg && fs.existsSync(ffmpeg)) {
        try {
          const probe = spawnSync(ffmpeg, ["-i", finalFile], { encoding: "utf8" });
          const probeOut = probe.stderr || "";
          const hasVideo = /Stream #.*Video:/i.test(probeOut);
          const hasH264 = /Stream #.*Video:.*(h264|avc1)/i.test(probeOut);
          const hasAac = /Stream #.*Audio:.*(aac|mp4a)/i.test(probeOut);

          if (!hasVideo) {
            onError("Downloaded stream contains no video track. Please select another format or quality.");
            return;
          }

          // If the video is in AV1/VP9 or audio is Opus, normalize to universal H.264 + AAC MP4
          if (!hasH264 || !hasAac || !finalFile.endsWith(".mp4")) {
            const tempNormalized = path.join(STORAGE_DIR, `${jobId}_norm.mp4`);
            const vArgs = hasH264 ? ["-c:v", "copy"] : ["-c:v", "libx264", "-preset", "veryfast", "-crf", "22"];
            const aArgs = hasAac ? ["-c:a", "copy"] : ["-c:a", "aac", "-b:a", "192k"];

            const convertRes = spawnSync(
              ffmpeg,
              ["-y", "-i", finalFile, ...vArgs, ...aArgs, "-movflags", "+faststart", tempNormalized],
              { stdio: "ignore" }
            );

            if (convertRes.status === 0 && fs.existsSync(tempNormalized) && fs.statSync(tempNormalized).size > 1000) {
              try { fs.unlinkSync(finalFile); } catch {}
              const normalizedFinal = path.join(STORAGE_DIR, `${jobId}.mp4`);
              try {
                if (fs.existsSync(normalizedFinal)) fs.unlinkSync(normalizedFinal);
                fs.renameSync(tempNormalized, normalizedFinal);
                finalFile = normalizedFinal;
              } catch {
                finalFile = tempNormalized;
              }
            }
          }
        } catch (normErr) {
          console.warn("Stream normalization non-fatal warning:", normErr);
        }
      }

      // Clean up any remaining partials or separate stream files for this jobId
      try {
        const remaining = fs.readdirSync(STORAGE_DIR);
        for (const f of remaining) {
          if (f.startsWith(`${jobId}.`) && f !== path.basename(finalFile)) {
            if (f.includes(".f") || f.endsWith(".part") || f.endsWith(".ytdl") || f.endsWith(".temp")) {
              try { fs.unlinkSync(path.join(STORAGE_DIR, f)); } catch {}
            }
          }
        }
      } catch {}

      onComplete(finalFile);
    } else {
      onError(cleanYtDlpError(stderrOutput || `Download failed with exit code ${code}`));
    }
  });

  return py;
}
