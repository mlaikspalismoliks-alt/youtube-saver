import { NextResponse } from "next/server";
import { jobStore } from "@/lib/server/job-store";
import fs from "fs";
import path from "path";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const record = jobStore.get(id);

  if (!record || !record.actualFilePath || !fs.existsSync(record.actualFilePath)) {
    return NextResponse.json(
      { success: false, message: "File not ready or not found on server" },
      { status: 404 }
    );
  }

  const filePath = record.actualFilePath;
  const fileName = path.basename(filePath);
  const fileStat = fs.statSync(filePath);
  const fileStream = fs.createReadStream(filePath);

  const cleanTitle = (record.item.title || "media").replace(/[^a-zA-Z0-9_-]/g, "_");
  const ext = path.extname(fileName) || ".mp4";
  const downloadFileName = `${cleanTitle}${ext}`;

  // Stream file as attachment
  const headers = new Headers();
  headers.set("Content-Disposition", `attachment; filename="${downloadFileName}"`);
  headers.set(
    "Content-Type",
    ext === ".mp3" ? "audio/mpeg" : "video/mp4"
  );
  headers.set("Content-Length", fileStat.size.toString());

  // @ts-expect-error Node.js readable stream into Web ReadableStream
  return new NextResponse(fileStream, { headers });
}
