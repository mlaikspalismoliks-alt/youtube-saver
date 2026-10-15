"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, AlertTriangle, ShieldAlert, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DownloadErrorProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  onReset?: () => void;
  isCancelled?: boolean;
}

export function DownloadError({
  title = "Unable to analyze this URL",
  message = "Please check the URL and try again.",
  onRetry,
  onReset,
  isCancelled = false,
}: DownloadErrorProps) {
  const isBotBlock =
    message.toLowerCase().includes("bot") ||
    message.toLowerCase().includes("cookie") ||
    message.toLowerCase().includes("sign in to confirm");

  const Icon = isCancelled ? AlertTriangle : isBotBlock ? ShieldAlert : AlertCircle;

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-surface/90 backdrop-blur-xl p-6 shadow-card space-y-4 animate-in fade-in duration-200">
      <div className="flex items-start gap-3.5">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isCancelled
              ? "bg-warning/15 border-warning/30 text-warning"
              : isBotBlock
              ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
              : "bg-error/15 border-error/30 text-error"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="space-y-1.5 flex-1">
          <h3 className="text-base font-semibold text-text-primary tracking-tight">
            {isCancelled ? "Download cancelled" : isBotBlock ? "YouTube Bot Challenge Detected" : title}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed max-w-xl font-mono">
            {message}
          </p>

          {isBotBlock && (
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200/90 space-y-1 font-sans">
              <span className="font-semibold block text-amber-300">
                How to resolve this roadblock:
              </span>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Cloud servers (like Render or AWS) share IP addresses that YouTube flags with bot challenges. You can permanently bypass this by exporting your browser cookies using the free <span className="font-mono text-white">Get cookies.txt LOCALLY</span> extension and pasting them in Settings.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-2.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="gap-2 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{isCancelled ? "Start again" : "Try again"}</span>
        </Button>

        {isBotBlock && (
          <Link href="/settings">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs border-accent/40 text-accent hover:bg-accent/10"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Configure Cookies in Settings</span>
            </Button>
          </Link>
        )}

        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-text-muted hover:text-text-primary"
          >
            Clear and reset
          </Button>
        )}
      </div>
    </div>
  );
}
