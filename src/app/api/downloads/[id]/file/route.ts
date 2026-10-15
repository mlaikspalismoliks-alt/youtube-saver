import { NextResponse } from "next/server";
import { jobStore } from "@/lib/server/job-store";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const record = jobStore.get(id);
  const storageDir = path.join(process.cwd(), "media_storage");

  let filePath = record?.actualFilePath;

  const isAudioJob = record?.item?.format?.toLowerCase().includes("mp3");
  const preferredExt = isAudioJob ? ".mp3" : ".mp4";

  // Fallback: Check if file exists on disk if memory record is missing or path not recorded
  if (!filePath || !fs.existsSync(filePath)) {
    if (fs.existsSync(storageDir)) {
      const exactCandidate = path.join(storageDir, `${id}${preferredExt}`);
      if (fs.existsSync(exactCandidate)) {
        filePath = exactCandidate;
      } else {
        const files = fs.readdirSync(storageDir);
        // Exclude temporary or partial files (.part, .ytdl, .temp, .f140, etc.)
        const validFiles = files.filter(
          (f) =>
            f.startsWith(`${id}.`) &&
            !f.endsWith(".part") &&
            !f.endsWith(".ytdl") &&
            !f.endsWith(".temp") &&
            !f.includes(".f")
        );

        if (isAudioJob) {
          const audioMatch = validFiles.find((f) => f.endsWith(".mp3") || f.endsWith(".m4a") || f.endsWith(".aac"));
          if (audioMatch) filePath = path.join(storageDir, audioMatch);
        } else {
          const videoMatch = validFiles.find((f) => f.endsWith(".mp4") || f.endsWith(".mkv") || f.endsWith(".webm"));
          if (videoMatch) filePath = path.join(storageDir, videoMatch);
        }

        if (!filePath && validFiles.length > 0) {
          filePath = path.join(storageDir, validFiles[0]);
        }
      }
    }
  }

  if (!filePath || !fs.existsSync(filePath)) {
    return NextResponse.json(
      { success: false, message: "File not ready or not found on server" },
      { status: 404 }
    );
  }

  const fileName = path.basename(filePath);
  const fileStat = fs.statSync(filePath);
  const fileStream = fs.createReadStream(filePath);

  const rawTitle = record?.item?.title || "media";
  const cleanTitle = rawTitle.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
  const ext = path.extname(fileName) || preferredExt;
  const downloadFileName = `${cleanTitle}${ext}`;

  // Accurate MIME type mapping
  let contentType = "application/octet-stream";
  const lowerExt = ext.toLowerCase();
  if (lowerExt === ".mp4") contentType = "video/mp4";
  else if (lowerExt === ".mp3") contentType = "audio/mpeg";
  else if (lowerExt === ".m4a") contentType = "audio/mp4";
  else if (lowerExt === ".webm") contentType = "video/webm";

  // Stream file as attachment
  const headers = new Headers();
  headers.set(
    "Content-Disposition",
    `attachment; filename="${downloadFileName}"; filename*=UTF-8''${encodeURIComponent(downloadFileName)}`
  );
  headers.set("Content-Type", contentType);
  headers.set("Content-Length", fileStat.size.toString());

  // Web Streams compliant stream
  const webStream = Readable.toWeb(fileStream);
  return new Response(webStream as any, { headers });
}
