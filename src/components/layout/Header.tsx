"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Shield, Sparkles, HardDrive } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { formatBytes } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { settings } = useWorkspace();

  const getPageInfo = () => {
    switch (pathname) {
      case "/":
        return { title: "Media Downloader", section: "Workspace" };
      case "/downloads":
        return { title: "Downloads Queue", section: "Jobs" };
      case "/history":
        return { title: "Media History", section: "Archive" };
      case "/settings":
        return { title: "Workspace Settings", section: "System" };
      case "/about":
        return { title: "About MediaFlow", section: "System" };
      default:
        return { title: "MediaFlow", section: "Workspace" };
    }
  };

  const { title, section } = getPageInfo();

  return (
    <header className="hidden lg:flex items-center justify-between h-14 px-8 border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-text-muted">{section}</span>
        <span className="text-text-muted">/</span>
        <span className="text-text-primary font-medium">{title}</span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface border border-border text-text-secondary">
          <HardDrive className="h-3.5 w-3.5 text-text-muted" />
          <span>Storage:</span>
          <span className="font-mono text-text-primary">
            {formatBytes(settings.storageUsedBytes)} / {formatBytes(settings.storageMaxBytes)}
          </span>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface border border-border text-text-secondary">
          <Shield className="h-3.5 w-3.5 text-accent" />
          <span>Internal Access Verified</span>
        </div>
      </div>
    </header>
  );
}
