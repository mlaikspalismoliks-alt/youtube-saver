"use client";

import * as React from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { formatBytes } from "@/lib/utils";
import {
  Sliders,
  HardDrive,
  Palette,
  Info,
  Check,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings, clearTempStorage } = useWorkspace();
  const [clearing, setClearing] = React.useState(false);

  const handleClearFiles = async () => {
    setClearing(true);
    await clearTempStorage();
    setClearing(false);
  };

  const storagePercentage = Math.round(
    (settings.storageUsedBytes / settings.storageMaxBytes) * 100
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Settings
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Configure workspace preferences, storage retention, and download defaults.
          </p>
        </div>

        {/* SECTION 1: GENERAL */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-accent" />
              <CardTitle>General</CardTitle>
            </div>
            <CardDescription>
              Set default video and audio encoding profiles for upcoming jobs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Default Format */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
              <div>
                <label className="text-sm font-medium text-text-primary block">
                  Default format
                </label>
                <span className="text-xs text-text-muted">
                  Preferred container format when analyzing new media streams.
                </span>
              </div>
              <select
                value={settings.defaultFormat}
                onChange={(e) =>
                  updateSettings({
                    defaultFormat: e.target.value as "MP4" | "MP3" | "WEBM",
                  })
                }
                className="w-full sm:w-40 h-9 px-3 rounded-lg bg-surface-elevated border border-border text-sm text-text-primary focus:outline-none focus:border-accent font-mono"
              >
                <option value="MP4">MP4</option>
                <option value="MP3">MP3</option>
                <option value="WEBM">WEBM</option>
              </select>
            </div>

            {/* Default Quality */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
              <div>
                <label className="text-sm font-medium text-text-primary block">
                  Default quality
                </label>
                <span className="text-xs text-text-muted">
                  Standard resolution target selected by default.
                </span>
              </div>
              <select
                value={settings.defaultQuality}
                onChange={(e) =>
                  updateSettings({
                    defaultQuality: e.target.value as "1080p" | "720p" | "480p" | "320kbps",
                  })
                }
                className="w-full sm:w-40 h-9 px-3 rounded-lg bg-surface-elevated border border-border text-sm text-text-primary focus:outline-none focus:border-accent font-mono"
              >
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
                <option value="320kbps">320 kbps</option>
              </select>
            </div>

            {/* Download Behavior */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="text-sm font-medium text-text-primary block">
                  Download behavior
                </label>
                <span className="text-xs text-text-muted">
                  Automatically save completed downloads to local storage.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.autoSaveDownloads}
                onClick={() =>
                  updateSettings({ autoSaveDownloads: !settings.autoSaveDownloads })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  settings.autoSaveDownloads ? "bg-accent" : "bg-surface-elevated border-border"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.autoSaveDownloads ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: STORAGE */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-accent" />
              <CardTitle>Storage</CardTitle>
            </div>
            <CardDescription>
              Manage local cache allocations and temporary transcode buffers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">
                  Temporary files
                </span>
                <span className="text-xs font-mono text-text-secondary">
                  {formatBytes(settings.storageUsedBytes)} / {formatBytes(settings.storageMaxBytes)}
                </span>
              </div>

              <Progress value={storagePercentage} animated={false} />

              <p className="text-xs text-text-muted mt-2">
                Files are automatically cleaned after processing.
              </p>
            </div>

            <div className="pt-2 flex justify-start">
              <Button
                variant="outline"
                size="sm"
                isLoading={clearing}
                onClick={handleClearFiles}
                className="gap-2 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 text-text-muted" />
                <span>Clear temporary files</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: INTERFACE */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-accent" />
              <CardTitle>Interface</CardTitle>
            </div>
            <CardDescription>
              Customize application density and visual presentation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-border-subtle">
              <div>
                <span className="text-sm font-medium text-text-primary block">
                  Appearance
                </span>
                <span className="text-xs text-text-muted">
                  High-contrast dark theme optimized for low-light editing suites.
                </span>
              </div>
              <Badge variant="accent" size="md">
                Dark
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-sm font-medium text-text-primary block">
                  Compact mode
                </span>
                <span className="text-xs text-text-muted">
                  Reduce vertical table padding and list margins.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.compactMode}
                onClick={() =>
                  updateSettings({ compactMode: !settings.compactMode })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  settings.compactMode ? "bg-accent" : "bg-surface-elevated border-border"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.compactMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: ABOUT */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-accent" />
              <CardTitle>About</CardTitle>
            </div>
            <CardDescription>
              System environment and client build information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs py-1.5 border-b border-border-subtle">
              <span className="text-text-muted">Application</span>
              <span className="text-text-primary font-semibold">MEDIAFLOW</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1.5 border-b border-border-subtle">
              <span className="text-text-muted">Subsystem</span>
              <span className="text-text-secondary">Private Media Workspace</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1.5">
              <span className="text-text-muted">Version</span>
              <span className="font-mono text-accent font-semibold">1.0.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
