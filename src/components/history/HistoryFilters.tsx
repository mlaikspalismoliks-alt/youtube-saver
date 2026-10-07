"use client";

import * as React from "react";
import { Search, ArrowUpDown, X } from "lucide-react";
import { HistoryFilterType, HistorySortType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HistoryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentFilter: HistoryFilterType;
  onFilterChange: (filter: HistoryFilterType) => void;
  currentSort: HistorySortType;
  onSortChange: (sort: HistorySortType) => void;
}

export function HistoryFilters({
  searchQuery,
  onSearchChange,
  currentFilter,
  onFilterChange,
  currentSort,
  onSortChange,
}: HistoryFiltersProps) {
  const filterOptions: { id: HistoryFilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "completed", label: "Completed" },
    { id: "failed", label: "Failed" },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="h-4 w-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search history..."
          className="w-full h-10 pl-9 pr-8 bg-surface-elevated border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter Tabs & Sort Dropdown */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-surface-elevated border border-border rounded-lg">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onFilterChange(opt.id)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                currentFilter === opt.id
                  ? "bg-surface text-text-primary border border-border shadow-subtle"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 bg-surface-elevated border border-border rounded-lg px-2.5 py-1 text-xs">
          <ArrowUpDown className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <select
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value as HistorySortType)}
            className="bg-transparent text-text-primary text-xs focus:outline-none cursor-pointer py-1"
            aria-label="Sort order"
          >
            <option value="newest" className="bg-surface text-text-primary">
              Newest
            </option>
            <option value="oldest" className="bg-surface text-text-primary">
              Oldest
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}
