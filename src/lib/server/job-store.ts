import { DownloadItem } from "@/lib/types";
import { ChildProcess } from "child_process";

export interface ActiveJobRecord {
  item: DownloadItem;
  process?: ChildProcess;
  actualFilePath?: string;
}

// In-memory store persistent across API calls in the Node.js server lifecycle
declare global {
  // eslint-disable-next-line no-var
  var __MEDIAFLOW_JOBS__: Map<string, ActiveJobRecord> | undefined;
}

if (!global.__MEDIAFLOW_JOBS__) {
  global.__MEDIAFLOW_JOBS__ = new Map<string, ActiveJobRecord>();
}

export const jobStore = global.__MEDIAFLOW_JOBS__;
