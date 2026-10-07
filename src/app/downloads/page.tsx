"use client";

import * as React from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { DownloadCard } from "@/components/downloads/DownloadCard";
import { DownloadTabs } from "@/components/downloads/DownloadTabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { DownloadFilterTab } from "@/lib/types";
import { ArrowDownToLine, Plus, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function DownloadsPage() {
  const { downloads, deleteDownload, retryDownload, handleCancelDownload } = useWorkspace();
  const [currentTab, setCurrentTab] = React.useState<DownloadFilterTab>("all");

  const filteredDownloads = React.useMemo(() => {
    switch (currentTab) {
      case "active":
        return downloads.filter((d) => d.status === "downloading");
      case "completed":
        return downloads.filter((d) => d.status === "completed");
      case "failed":
        return downloads.filter((d) => d.status === "failed" || d.status === "cancelled");
      default:
        return downloads;
    }
  }, [downloads, currentTab]);

  const counts = React.useMemo(() => {
    return {
      all: downloads.length,
      active: downloads.filter((d) => d.status === "downloading").length,
      completed: downloads.filter((d) => d.status === "completed").length,
      failed: downloads.filter((d) => d.status === "failed" || d.status === "cancelled").length,
    };
  }, [downloads]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Downloads
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Monitor your active and completed media jobs.
            </p>
          </div>

          <Link href="/">
            <Button variant="primary" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span>New Download</span>
            </Button>
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <DownloadTabs
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            counts={counts}
          />
        </div>

        {/* Download Items List */}
        {filteredDownloads.length > 0 ? (
          <div className="space-y-3">
            {filteredDownloads.map((item) => (
              <DownloadCard
                key={item.id}
                item={item}
                onDelete={deleteDownload}
                onRetry={retryDownload}
                onCancel={() => handleCancelDownload()}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ArrowDownToLine}
            title={
              currentTab === "all"
                ? "No media jobs found"
                : `No ${currentTab} jobs`
            }
            description={
              currentTab === "all"
                ? "Your workspace queue is currently empty. Start processing media from the primary downloader."
                : `There are currently no media tasks in the ${currentTab} state.`
            }
            actionLabel="Start Download"
            onAction={() => {
              window.location.href = "/";
            }}
          />
        )}
      </div>
    </div>
  );
}
