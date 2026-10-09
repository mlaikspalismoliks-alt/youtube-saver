"use client";

import * as React from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { HistoryCard } from "@/components/history/HistoryCard";
import { HistoryFilters } from "@/components/history/HistoryFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import { HistoryFilterType, HistorySortType } from "@/lib/types";
import { History as HistoryIcon, SearchX } from "lucide-react";

export default function HistoryPage() {
  const { history, deleteHistoryItem } = useWorkspace();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentFilter, setCurrentFilter] = React.useState<HistoryFilterType>("all");
  const [currentSort, setCurrentSort] = React.useState<HistorySortType>("newest");

  const filteredHistory = React.useMemo(() => {
    let result = [...history];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q) ||
          item.format.toLowerCase().includes(q) ||
          item.quality.toLowerCase().includes(q)
      );
    }

    // Filter by status tab
    if (currentFilter !== "all") {
      result = result.filter((item) => item.status === currentFilter);
    }

    // Sort order
    result.sort((a, b) => {
      if (currentSort === "newest") {
        return b.timestamp - a.timestamp;
      } else {
        return a.timestamp - b.timestamp;
      }
    });

    return result;
  }, [history, searchQuery, currentFilter, currentSort]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span>Extraction Archive</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 font-mono">
            Historical YouTube audio and video extraction logs
          </p>
        </div>

        {/* Search, Filters, and Sorting controls */}
        <div className="pt-2">
          <HistoryFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            currentSort={currentSort}
            onSortChange={setCurrentSort}
          />
        </div>

        {/* History items listing */}
        {filteredHistory.length > 0 ? (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onDelete={deleteHistoryItem}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={searchQuery ? SearchX : HistoryIcon}
            title={
              searchQuery
                ? `No results for "${searchQuery}"`
                : "No media history recorded"
            }
            description={
              searchQuery
                ? "Try searching for a different title, file format, or clear the active search filter."
                : "No media has been processed in this workspace yet. When downloads complete, their records will appear here."
            }
            actionLabel={searchQuery ? "Clear Search" : undefined}
            onAction={searchQuery ? () => setSearchQuery("") : undefined}
          />
        )}
      </div>
    </div>
  );
}
