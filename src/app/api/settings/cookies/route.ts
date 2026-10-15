import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { STORAGE_DIR, getCookieFilePath } from "@/lib/server/media-engine";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export async function GET() {
  try {
    const cookiePath = getCookieFilePath();
    const envCookies = !!(process.env.YOUTUBE_COOKIES || process.env.COOKIES_DATA || process.env.COOKIES_CONTENT);
    const fileExists = fs.existsSync(path.join(STORAGE_DIR, "cookies.txt"));

    return NextResponse.json({
      success: true,
      hasCookies: Boolean(cookiePath),
      source: envCookies ? "environment" : fileExists ? "storage_file" : "none",
      path: cookiePath || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookiesText = body?.cookiesText;

    if (!cookiesText || typeof cookiesText !== "string" || !cookiesText.trim()) {
      return NextResponse.json(
        { success: false, message: "No cookie content provided." },
        { status: 400 }
      );
    }

    const clean = cookiesText.trim();
    const targetFile = path.join(STORAGE_DIR, "cookies.txt");

    fs.writeFileSync(targetFile, clean, "utf-8");

    return NextResponse.json({
      success: true,
      message: "YouTube cookies successfully saved and activated.",
      bytes: Buffer.byteLength(clean, "utf-8"),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const targetFile = path.join(STORAGE_DIR, "cookies.txt");
    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
    }

    return NextResponse.json({
      success: true,
      message: "YouTube cookies deleted from server storage.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
