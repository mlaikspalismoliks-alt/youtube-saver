"use client";

import * as React from "react";
import Image from "next/image";
import { Clock, Calendar, Film, RefreshCw, CheckCircle2, Play, Eye, Radio, ExternalLink } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface MediaPreviewProps {
  media: MediaItem;
  onChangeUrl: () => void;
}

export function MediaPreview({ media, onChangeUrl }: MediaPreviewProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-surface/90 backdrop-blur-2xl p-4 sm:p-6 shadow-card hover:border-accent/40 transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Futuristic YouTube Video Player Card */}
        <div className="relative w-full md:w-80 aspect-video rounded-xl overflow-hidden bg-surface-elevated border border-white/10 shadow-neon shrink-0 group">
          {!imageError ? (
            <Image
              src={media.thumbnailUrl}
              alt={media.title}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              onError={() => setImageError(true)}
              priority
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-elevated text-text-muted p-4 text-center">
              <Film className="h-8 w-8 mb-2 text-accent" />
              <span className="text-xs font-mono">MEDIA STREAM</span>
            </div>
          )}

          {/* Futuristic Play Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
            <div className="h-11 w-11 rounded-full bg-accent/90 group-hover:bg-accent text-white flex items-center justify-center shadow-neon group-hover:scale-110 transition-transform">
              <Play className="h-5 w-5 fill-white translate-x-0.5" />
            </div>
          </div>

          {/* YouTube Duration badge */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/90 backdrop-blur-md text-[11px] font-mono font-bold text-white border border-white/10 shadow-lg">
            <Clock className="h-3 w-3 text-accent" />
            <span>{media.duration}</span>
          </div>

          {/* Top Left Live Stream Badge */}
          <div className="absolute top-2.5 left-2.5">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-accent text-[10px] font-mono font-extrabold uppercase tracking-widest text-white shadow-neon">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              YOUTUBE
            </span>
          </div>
        </div>

        {/* Media Information HUD */}
        <div className="flex-1 w-full flex flex-col justify-between min-w-0 space-y-3">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/40 text-[11px] font-mono font-bold text-accent">
                  STREAMS READY
                </span>
                {media.author && (
                  <span className="flex items-center gap-1 text-xs text-text-secondary font-medium">
                    <span>{media.author}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent fill-accent/20" />
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onChangeUrl}
                className="text-xs h-7 px-2.5 gap-1.5 font-mono border-white/10 hover:border-accent/50 text-text-secondary hover:text-white"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Switch URL</span>
              </Button>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {media.title}
            </h2>

            {media.description && (
              <p className="text-xs text-text-muted line-clamp-2 leading-relaxed font-sans">
                {media.description}
              </p>
            )}
          </div>

          {/* Metadata telemetry */}
          <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs font-mono text-text-secondary">
            {media.viewCount && (
              <div className="flex items-center gap-1.5 text-white/90">
                <Eye className="h-3.5 w-3.5 text-accent" />
                <span>{media.viewCount}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-text-muted" />
              <span>{media.uploadedDate}</span>
            </div>

            <div className="flex items-center gap-1.5 text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span>4K / HD / MP3 AVAILABLE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
