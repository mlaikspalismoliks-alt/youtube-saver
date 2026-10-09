import { NextResponse } from "next/server";
import { jobStore } from "@/lib/server/job-store";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const record = jobStore.get(id);

  if (!record) {
    return NextResponse.json(
      { success: false, message: "Job not found" },
      { status: 404 }
    );
  }

  if (record.process) {
    try {
      record.process.kill();
    } catch {
      // process may have already exited
    }
  }

  record.item.status = "cancelled";
  record.item.error = "Cancelled by operator.";

  return NextResponse.json({
    success: true,
    downloadId: id,
    status: "cancelled",
  });
}
