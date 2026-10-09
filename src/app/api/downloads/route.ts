import { NextResponse } from "next/server";
import { jobStore, ActiveJobRecord } from "@/lib/server/job-store";
import { startMediaDownload } from "@/lib/server/media-engine";
import { DownloadItem } from "@/lib/types";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export async function GET() {
  const jobs = Array.from(jobStore.values()).map((r) => r.item);
  return NextResponse.json({ success: true, downloads: jobs });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { media, format } = body;

    if (!media || !format || !media.url) {
      return NextResponse.json(
        { success: false, message: "Missing media or format specification" },
        { status: 400 }
      );
    }

    const downloadId = `dl-${Date.now()}`;
    const initialJob: DownloadItem = {
      id: downloadId,
      mediaId: media.id,
      title: media.title,
      thumbnailUrl: media.thumbnailUrl,
      source: media.source,
      format: format.container,
      quality: format.label,
      resolution: format.resolution,
      size: format.estimatedSize?.replace("~", "") || "Pending",
      status: "downloading",
      progress: {
        percentage: 0,
        downloadedBytes: 0,
        totalBytes: format.approxBytes || 100000000,
        downloadSpeed: "Connecting...",
        timeRemaining: "Estimating...",
        etaSeconds: 45,
      },
      createdAt: new Date().toISOString(),
    };

    // Store in jobStore
    const record: ActiveJobRecord = { item: initialJob };
    jobStore.set(downloadId, record);

    // Spawn download in background
    const process = startMediaDownload(
      downloadId,
      media.url,
      format.id,
      // onProgress
      (pct, speed, eta) => {
        const current = jobStore.get(downloadId);
        if (current && current.item.status === "downloading") {
          current.item.progress.percentage = Math.round(pct);
          current.item.progress.downloadSpeed = speed;
          current.item.progress.timeRemaining = eta.includes(":") ? `ETA ${eta}` : eta;
          const total = current.item.progress.totalBytes || 100000000;
          current.item.progress.downloadedBytes = Math.round((pct / 100) * total);
        }
      },
      // onComplete
      (filePath) => {
        const current = jobStore.get(downloadId);
        if (current) {
          current.item.status = "completed";
          current.item.progress.percentage = 100;
          current.item.progress.downloadSpeed = "0 MB/s";
          current.item.progress.timeRemaining = "Complete";
          current.item.completedAt = new Date().toISOString();
          current.actualFilePath = filePath;
        }
      },
      // onError
      (err) => {
        const current = jobStore.get(downloadId);
        if (current && current.item.status !== "cancelled") {
          current.item.status = "failed";
          current.item.error = err.slice(0, 300);
        }
      }
    );

    // Save child process to allow cancellation
    record.process = process;

    return NextResponse.json({
      success: true,
      downloadId,
      status: "downloading",
      job: initialJob,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
