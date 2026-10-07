"use client";

import * as React from "react";
import { Link2, Clipboard, X, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useToast } from "@/components/ui/Toast";

export function UrlInput() {
  const { mediaUrl, setMediaUrl, handleAnalyze, downloaderStatus } = useWorkspace();
  const { showToast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isAnalyzing = downloaderStatus === "analyzing";

  const handlePaste = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setMediaUrl(text.trim());
          showToast("URL pasted from clipboard.", "info");
          inputRef.current?.focus();
        }
      } else {
        showToast("Clipboard permission not available in this environment.", "info");
      }
    } catch {
      showToast("Clipboard access denied. Please paste manually.", "info");
    }
  };

  const handleClear = () => {
    setMediaUrl("");
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = mediaUrl.trim().toLowerCase();
    if (!clean) {
      showToast("Please enter a YouTube URL.", "error");
      return;
    }

    if (!clean.includes("youtube.com") && !clean.includes("youtu.be")) {
      showToast("Only YouTube URLs are supported.", "error");
      return;
    }

    handleAnalyze();
  };

  // Sample quick presets for easy testing
  const samplePresets = [
    {
      label: "Default: Summer Campaign",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      label: "Sample: Global Summit Reel",
      url: "https://www.youtube.com/watch?v=k9n2b7XzL98&v=keynote",
    },
    {
      label: "Sample: Sound Master Foley",
      url: "https://www.youtube.com/watch?v=m17a5Q7Zk8a&v=audio",
    },
  ];

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <label
          htmlFor="media-url-input"
          className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2"
        >
          YouTube Video URL
        </label>

        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-xl border border-border bg-surface-elevated shadow-subtle focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
          <div className="flex items-center flex-1 min-w-0 px-2.5">
            <Link2 className="h-4 w-4 text-text-muted shrink-0 mr-2.5" />
            <input
              id="media-url-input"
              ref={inputRef}
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Paste a YouTube video or Shorts link (e.g. https://www.youtube.com/watch?v=...)"
              disabled={isAnalyzing}
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none min-h-[40px] truncate"
            />

            {mediaUrl && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface transition-colors mr-1"
                aria-label="Clear input"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface/70 hover:bg-surface border border-border rounded-md transition-colors shrink-0"
              title="Paste from clipboard"
            >
              <Clipboard className="h-3 w-3" />
              <span className="hidden xs:inline">Paste</span>
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isAnalyzing}
            className="w-full sm:w-auto shrink-0 font-medium px-5"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </form>

      {/* Quick Demo Presets Selector */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
        <span className="text-[11px] uppercase tracking-wider font-medium text-text-muted mr-1">
          Try preset:
        </span>
        {samplePresets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setMediaUrl(preset.url);
              handleAnalyze(preset.url);
            }}
            disabled={isAnalyzing}
            className="px-2 py-0.5 rounded text-[11px] bg-surface border border-border-subtle hover:border-border hover:text-text-primary transition-colors text-text-secondary"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
