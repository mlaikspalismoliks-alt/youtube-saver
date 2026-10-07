import * as React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Loader2 } from "lucide-react";

export function AnalyzingSkeleton() {
  return (
    <div className="w-full rounded-xl border border-border bg-surface p-5 sm:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header status */}
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 text-accent animate-spin" />
        <span className="text-sm font-medium text-text-primary tracking-tight">
          Analyzing media...
        </span>
      </div>

      {/* Media Preview Skeleton */}
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Thumbnail skeleton */}
        <div className="w-full md:w-64 aspect-video rounded-lg overflow-hidden shrink-0">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Details skeleton */}
        <div className="flex-1 w-full space-y-3">
          <Skeleton className="h-6 w-3/4 rounded-md" />
          <div className="flex flex-wrap gap-2 pt-1">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <Skeleton className="h-12 w-full rounded-md mt-2" />
        </div>
      </div>

      {/* Format options skeleton */}
      <div className="space-y-3 pt-4 border-t border-border-subtle">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
