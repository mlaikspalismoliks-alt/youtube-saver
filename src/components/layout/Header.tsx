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
        return { title: "About YouSaver", section: "System" };
      default:
        return { title: "YouSaver", section: "Workspace" };
    }
  };

  const { title, section } = getPageInfo();

  return (
    <header className="hidden lg:flex items-center justify-between h-14 px-8 border-b border-border/80 bg-surface/80 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-text-muted font-mono">{section}</span>
        <span className="text-accent/60 font-mono">/</span>
        <span className="text-text-primary font-semibold tracking-wide">{title}</span>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent font-mono">
          <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
          <span className="font-semibold text-[11px] tracking-wider">LIVE YT STREAM ENGINE</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-border text-text-secondary font-mono">
          <HardDrive className="h-3.5 w-3.5 text-text-muted" />
          <span>DISK:</span>
          <span className="font-mono text-text-primary">
            {formatBytes(settings.storageUsedBytes)} / {formatBytes(settings.storageMaxBytes)}
          </span>
        </div>
      </div>
    </header>
  );
}
