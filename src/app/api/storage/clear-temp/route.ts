import { NextResponse } from "next/server";
import { STORAGE_DIR } from "@/lib/server/media-engine";
import fs from "fs";
import path from "path";

export async function POST() {
  let freedBytes = 0;

  try {
    if (fs.existsSync(STORAGE_DIR)) {
      const files = fs.readdirSync(STORAGE_DIR);
      for (const file of files) {
        const filePath = path.join(STORAGE_DIR, file);
        const stat = fs.statSync(filePath);
        freedBytes += stat.size;
        fs.unlinkSync(filePath);
      }
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, freedBytes });
}
