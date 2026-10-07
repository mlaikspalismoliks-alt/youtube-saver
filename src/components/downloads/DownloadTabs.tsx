"use client";

import * as React from "react";
import { DownloadFilterTab } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DownloadTabsProps {
  currentTab: DownloadFilterTab;
  onTabChange: (tab: DownloadFilterTab) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
    failed: number;
  };
}

export function DownloadTabs({
  currentTab,
  onTabChange,
  counts,
}: DownloadTabsProps) {
  const tabs: { id: DownloadFilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "active", label: "Active", count: counts.active },
    { id: "completed", label: "Completed", count: counts.completed },
    { id: "failed", label: "Failed", count: counts.failed },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-surface-elevated/80 border border-border rounded-xl w-fit overflow-x-auto max-w-full">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0",
              isActive
                ? "bg-surface text-text-primary border border-border shadow-subtle"
                : "text-text-secondary hover:text-text-primary hover:bg-surface/50 border border-transparent"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                isActive
                  ? "bg-accent/20 text-accent font-semibold"
                  : "bg-surface-elevated text-text-muted"
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
