"use client";

import * as React from "react";
import { Link2, Clipboard, X, Search, Sparkles, Play, Zap } from "lucide-react";
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
      label: "4K Music: Rick Astley",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
      label: "Classic: First YouTube Video",
      url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    },
    {
      label: "Ultra HD: Big Buck Bunny",
      url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    },
  ];

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="media-url-input"
            className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-text-secondary uppercase"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span>YouTube Stream Link</span>
          </label>
          <span className="text-[11px] font-mono text-accent/80">Supports Shorts • Videos • Live</span>
        </div>

        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-2xl border border-white/10 bg-surface/90 backdrop-blur-2xl shadow-card focus-within:border-accent/80 focus-within:shadow-neon transition-all duration-300">
          <div className="flex items-center flex-1 min-w-0 px-2.5">
            <div className="h-7 w-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0 mr-3">
              <Play className="h-3.5 w-3.5 fill-accent text-accent translate-x-0.2" />
            </div>
            <input
              id="media-url-input"
              ref={inputRef}
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Paste YouTube link (https://www.youtube.com/watch?v=...)"
              disabled={isAnalyzing}
              className="w-full bg-transparent text-sm font-medium text-white placeholder:text-text-muted focus:outline-none min-h-[42px] truncate"
            />

            {mediaUrl && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-md text-text-muted hover:text-white hover:bg-surface-elevated transition-colors mr-1"
                aria-label="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-text-secondary hover:text-white bg-surface-elevated/80 hover:bg-surface-elevated border border-border hover:border-accent/40 rounded-lg transition-colors shrink-0"
              title="Paste from clipboard"
            >
              <Clipboard className="h-3.5 w-3.5 text-accent" />
              <span className="hidden xs:inline">Paste</span>
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isAnalyzing}
            className="w-full sm:w-auto shrink-0 font-bold px-6 py-2.5 rounded-xl shadow-neon hover:shadow-neon-lg gap-2"
          >
            <Zap className="h-4 w-4 fill-current" />
            <span>{isAnalyzing ? "Extracting..." : "Analyze Media"}</span>
          </Button>
        </div>
      </form>

      {/* Quick Demo Presets Selector */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted mr-1">
          Quick Demo:
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
            className="px-2.5 py-1 rounded-lg text-xs font-mono bg-surface-elevated/60 border border-white/5 hover:border-accent/40 hover:text-white hover:bg-surface-elevated transition-all text-text-secondary flex items-center gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
