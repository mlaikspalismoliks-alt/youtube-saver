import { NextResponse } from "next/server";
import { jobStore } from "@/lib/server/job-store";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const record = jobStore.get(id);
  const storageDir = path.join(process.cwd(), "media_storage");

  let filePath = record?.actualFilePath;

  // Fallback: Check if file exists on disk if memory record is missing or path not recorded
  if (!filePath || !fs.existsSync(filePath)) {
    if (fs.existsSync(storageDir)) {
      const files = fs.readdirSync(storageDir);
      const match = files.find((f) => f.startsWith(`${id}.`));
      if (match) {
        filePath = path.join(storageDir, match);
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
  const ext = path.extname(fileName) || ".mp4";
  const downloadFileName = `${cleanTitle}${ext}`;

  // Stream file as attachment
  const headers = new Headers();
  headers.set(
    "Content-Disposition",
    `attachment; filename="${downloadFileName}"; filename*=UTF-8''${encodeURIComponent(downloadFileName)}`
  );
  headers.set(
    "Content-Type",
    ext.toLowerCase() === ".mp3" ? "audio/mpeg" : "video/mp4"
  );
  headers.set("Content-Length", fileStat.size.toString());

  // Web Streams compliant stream
  const webStream = Readable.toWeb(fileStream);
  return new Response(webStream as any, { headers });
}
