"use client";

import * as React from "react";
import Image from "next/image";
import { Clock, Calendar, Film, RefreshCw, CheckCircle, ExternalLink } from "lucide-react";
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
    <div className="w-full rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-subtle transition-all">
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Thumbnail: Top on mobile, Left on desktop */}
        <div className="relative w-full md:w-72 aspect-video rounded-lg overflow-hidden bg-surface-elevated border border-border/80 shrink-0 group">
          {!imageError ? (
            <Image
              src={media.thumbnailUrl}
              alt={media.title}
              fill
              sizes="(max-width: 768px) 100vw, 288px"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
              priority
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-elevated text-text-muted p-4 text-center">
              <Film className="h-8 w-8 mb-2 text-text-secondary" />
              <span className="text-xs font-medium">Cinema Preview</span>
            </div>
          )}

          {/* Duration overlay badge */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[11px] font-mono font-medium text-white shadow">
            <Clock className="h-3 w-3" />
            <span>{media.duration}</span>
          </div>

          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono uppercase tracking-wider text-white border border-white/10">
              {media.source}
            </span>
          </div>
        </div>

        {/* Media Information: Bottom on mobile, Right on desktop */}
        <div className="flex-1 w-full flex flex-col justify-between min-w-0">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="accent" size="sm">
                  Verified Media
                </Badge>
                {media.author && (
                  <span className="text-xs text-text-secondary font-medium">
                    {media.author}
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onChangeUrl}
                className="text-xs h-7 gap-1.5"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Change URL</span>
              </Button>
            </div>

            <h2 className="text-lg sm:text-xl font-semibold text-text-primary tracking-tight leading-snug">
              {media.title}
            </h2>

            {media.description && (
              <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                {media.description}
              </p>
            )}
          </div>

          {/* Metadata items */}
          <div className="mt-4 pt-3 border-t border-border-subtle flex flex-wrap items-center gap-4 text-xs text-text-secondary">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-text-muted" />
              <span>Uploaded {media.uploadedDate}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-text-muted" />
              <span>Duration {media.duration}</span>
            </div>

            {media.viewCount && (
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
                <span>{media.viewCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
