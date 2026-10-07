"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DownloadCloud,
  ArrowDownToLine,
  History,
  Settings,
  ShieldCheck,
  Radio,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/context/WorkspaceContext";

export function Sidebar() {
  const pathname = usePathname();
  const { downloads } = useWorkspace();

  const activeDownloadsCount = downloads.filter((d) => d.status === "downloading").length;

  const navLinks = [
    {
      name: "Home",
      href: "/",
      icon: DownloadCloud,
    },
    {
      name: "Downloads",
      href: "/downloads",
      icon: ArrowDownToLine,
      badge: activeDownloadsCount > 0 ? activeDownloadsCount : undefined,
    },
    {
      name: "History",
      href: "/history",
      icon: History,
    },
  ];

  const secondaryLinks = [
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      name: "About",
      href: "/about",
      icon: ShieldCheck,
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 pb-5 border-b border-border-subtle">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated border border-border group-hover:border-accent/60 transition-colors shadow-subtle">
            <Layers className="h-4 w-4 text-accent" />
          </div>
          <div>
            <div className="font-semibold text-sm tracking-wide text-text-primary">
              MEDIAFLOW
            </div>
            <div className="text-[11px] text-text-muted font-normal tracking-tight">
              Private Media Workspace
            </div>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Workspace
          </div>
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated/70 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-accent"
                        : "text-text-muted group-hover:text-text-secondary"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-accent text-[10px] font-mono font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-border-subtle pt-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Preferences
          </div>
          {secondaryLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated/70 border border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-accent"
                      : "text-text-muted group-hover:text-text-secondary"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Footprint */}
      <div className="p-4 border-t border-border-subtle bg-surface/50">
        <div className="rounded-lg bg-surface-elevated/80 border border-border/70 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-text-secondary">
              Private workspace
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <Radio className="h-3 w-3 text-success shrink-0" />
            <span className="truncate">Local Node · v1.0.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
