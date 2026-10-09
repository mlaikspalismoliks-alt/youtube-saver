import * as React from "react";
import { ShieldCheck, Play, Lock, Cpu, Globe, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Brand header */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-accent to-red-700 border border-red-400/40 shadow-neon">
            <Play className="h-8 w-8 fill-white text-white translate-x-0.5 filter drop-shadow" />
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              YOU<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-400">SAVER</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-accent font-mono mt-1 font-bold">
              Cyber YouTube Media Engine
            </p>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed max-w-lg mx-auto">
            High-performance direct YouTube stream extraction and audio demuxing platform. Built for instant 4K, 1080p video downloads and high-fidelity 320kbps MP3 audio processing.
          </p>
        </div>

        {/* System Details Box */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-text-muted pb-2 border-b border-border-subtle">
            System Specifications
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-surface-elevated/70 border border-border-subtle space-y-1">
              <span className="text-text-muted block">Build Version</span>
              <span className="font-mono text-text-primary font-medium text-sm">
                v1.0.0 (Production Release)
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-elevated/70 border border-border-subtle space-y-1">
              <span className="text-text-muted block">Architecture</span>
              <span className="font-mono text-text-primary font-medium text-sm">
                Frontend Prototype / Next.js
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-elevated/70 border border-border-subtle space-y-1">
              <span className="text-text-muted block">Ingestion Engine</span>
              <span className="font-mono text-text-primary font-medium text-sm">
                Simulated Sandbox Driver
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-elevated/70 border border-border-subtle space-y-1">
              <span className="text-text-muted block">Security Protocol</span>
              <span className="font-mono text-text-primary font-medium text-sm">
                Internal Node Token (AES-256)
              </span>
            </div>
          </div>
        </div>

        {/* Privacy & Compliance Notice */}
        <div className="rounded-xl border border-border/80 bg-surface/60 p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-text-primary font-semibold text-sm">
            <Lock className="h-4 w-4 text-accent" />
            <span>Privacy & Compliance Notice</span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            This internal portal is restricted to authorized personnel. All media processed through this workspace must comply with corporate copyright governance, intellectual property policy, and licensing agreements. Unofficial scraping or unauthorized distribution of third-party copyrighted material is strictly prohibited.
          </p>

          <p className="text-[11px] text-text-muted pt-2 border-t border-border-subtle">
            Session activity is logged in accordance with enterprise media retention guidelines.
          </p>
        </div>

        {/* Return Button */}
        <div className="text-center pt-2">
          <Link href="/">
            <Button variant="secondary" size="md" className="gap-2 text-xs">
              <span>Return to Media Downloader</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
