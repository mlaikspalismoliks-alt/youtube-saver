import { NextResponse } from "next/server";
import { jobStore } from "@/lib/server/job-store";
import fs from "fs";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const record = jobStore.get(id);

  if (!record) {
    return NextResponse.json(
      { success: false, message: "Download job not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    job: record.item,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const record = jobStore.get(id);

  if (record) {
    if (record.process) {
      try {
        record.process.kill();
      } catch {
        // ignore if already closed
      }
    }

    if (record.actualFilePath && fs.existsSync(record.actualFilePath)) {
      try {
        fs.unlinkSync(record.actualFilePath);
      } catch {
        // ignore
      }
    }

    jobStore.delete(id);
  }

  return NextResponse.json({ success: true, message: "Deleted" });
}
