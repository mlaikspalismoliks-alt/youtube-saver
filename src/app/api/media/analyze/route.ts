import { NextResponse } from "next/server";
import { extractMediaInfo, isYouTubeUrl } from "@/lib/server/media-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = body?.url;

    if (!url || typeof url !== "string" || !url.trim().startsWith("http")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNSUPPORTED_URL",
            message: "Please enter a valid HTTP or HTTPS media link.",
          },
        },
        { status: 400 }
      );
    }

    if (!isYouTubeUrl(url.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNSUPPORTED_URL",
            message: "Only YouTube URLs are supported. Please paste a valid YouTube video, shorts, or live stream link.",
          },
        },
        { status: 400 }
      );
    }

    const mediaItem = await extractMediaInfo(url.trim());

    return NextResponse.json({
      success: true,
      data: mediaItem,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "EXTRACTION_FAILED",
          message: error.message || "Failed to analyze URL.",
        },
      },
      { status: 500 }
    );
  }
}
