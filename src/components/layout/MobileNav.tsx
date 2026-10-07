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
  Menu,
  X,
  Layers,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/context/WorkspaceContext";

export function MobileNav() {
  const pathname = usePathname();
  const { downloads } = useWorkspace();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const activeDownloadsCount = downloads.filter((d) => d.status === "downloading").length;

  const bottomNavItems = [
    {
      name: "Downloader",
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
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const drawerLinks = [
    { name: "Home / Downloader", href: "/", icon: DownloadCloud },
    {
      name: "Downloads Dashboard",
      href: "/downloads",
      icon: ArrowDownToLine,
      badge: activeDownloadsCount > 0 ? activeDownloadsCount : undefined,
    },
    { name: "History Archive", href: "/history", icon: History },
    { name: "Workspace Settings", href: "/settings", icon: Settings },
    { name: "About MediaFlow", href: "/about", icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-surface/95 backdrop-blur-md border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border">
            <Layers className="h-4 w-4 text-accent" />
          </div>
          <div>
            <span className="font-semibold text-xs tracking-wider text-text-primary uppercase">
              MEDIAFLOW
            </span>
            <span className="block text-[10px] text-text-muted font-normal">
              Private Workspace
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {activeDownloadsCount > 0 && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/20 border border-accent/40 text-[10px] text-accent font-medium font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              {activeDownloadsCount} active
            </span>
          )}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Drawer Overlay & Content */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="relative ml-auto w-full max-w-xs bg-surface h-full flex flex-col border-l border-border shadow-elevated p-5 z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border">
                  <Layers className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-text-primary">MEDIAFLOW</div>
                  <div className="text-[10px] text-text-muted">Private Workspace</div>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {drawerLinks.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent/10 text-accent border border-accent/25"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="flex h-5 px-1.5 items-center justify-center rounded-full bg-accent text-[10px] font-mono font-semibold text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-border-subtle">
              <div className="rounded-lg bg-surface-elevated border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text-primary">
                    Private workspace
                  </span>
                  <span className="h-2 w-2 rounded-full bg-success" />
                </div>
                <p className="text-[11px] text-text-muted">
                  Company Authorized Media Node
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-2 py-1.5 flex items-center justify-around select-none">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[11px] font-medium transition-colors relative min-w-[64px]",
                isActive
                  ? "text-accent"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5 mb-0.5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-accent text-[9px] font-mono font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
