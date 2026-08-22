import React, { useState, useEffect } from "react";
import { Search, X, Star, ChevronsUpDown, RotateCcw, Filter } from "lucide-react";

const FilterBar = ({
  searchQuery,
  onSearchChange,
  difficultyFilter,
  onDifficultyChange,
  statusFilter,
  onStatusChange,
  bookmarkedOnly,
  onBookmarkedOnlyChange,
  onToggleAllExpanded,
  allExpanded,
  onResetFilters,
  hasActiveFilters,
}) => {
  // Local state for debounced search
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs mb-5 space-y-3.5">
      {/* Top row: Search input + Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
        {/* Search box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search problems by name or topic (e.g. Kadane, Binary Tree, Reverse)..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#070235]/15 focus:border-[#070235] bg-slate-50/60 placeholder-slate-400 text-slate-800 transition-all"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action buttons: Expand/Collapse all & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleAllExpanded}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title={allExpanded ? "Collapse all topics" : "Expand all topics"}
          >
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{allExpanded ? "Collapse All" : "Expand All"}</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-rose-600 bg-rose-50/50 hover:bg-rose-100/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Filter Chips & Toggles */}
      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 text-xs">
        {/* Difficulty Filter Chips */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mr-0.5">Difficulty:</span>
          {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => {
            const active = difficultyFilter === diff;
            return (
              <button
                key={diff}
                type="button"
                onClick={() => onDifficultyChange(diff)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? diff === "EASY"
                      ? "bg-emerald-600 text-white shadow-2xs font-semibold"
                      : diff === "MEDIUM"
                      ? "bg-amber-500 text-white shadow-2xs font-semibold"
                      : diff === "HARD"
                      ? "bg-rose-600 text-white shadow-2xs font-semibold"
                      : "bg-[#070235] text-white shadow-2xs font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {diff === "ALL" ? "All" : diff.charAt(0) + diff.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mr-0.5">Status:</span>
          {[
            { id: "ALL", label: "All" },
            { id: "TODO", label: "Todo" },
            { id: "DONE", label: "Done" },
          ].map((st) => {
            const active = statusFilter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => onStatusChange(st.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? "bg-[#070235] text-white shadow-2xs font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>

        {/* Bookmarked Filter Toggle */}
        <button
          type="button"
          onClick={() => onBookmarkedOnlyChange(!bookmarkedOnly)}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
            bookmarkedOnly
              ? "bg-amber-100 text-amber-900 border border-amber-300 font-semibold"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-transparent"
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${bookmarkedOnly ? "fill-amber-500 text-amber-600" : "text-slate-400"}`} />
          <span>Revision Bookmarks</span>
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
