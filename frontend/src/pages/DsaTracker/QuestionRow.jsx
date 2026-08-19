import React from "react";
import { Check, Star, ExternalLink, StickyNote } from "lucide-react";

const QuestionRow = ({
  question,
  onToggleStatus,
  onToggleBookmark,
  onOpenNotes,
  isTogglingStatus = false,
  isTogglingBookmark = false,
}) => {
  const isDone = question.status === "DONE";
  const isInProgress = question.status === "IN_PROGRESS";
  const isBookmarked = Boolean(question.bookmarked);
  const hasNotes = Boolean(question.notes && question.notes.trim().length > 0);

  // Difficulty badge colors
  const getDifficultyBadge = (diff) => {
    switch (diff?.toUpperCase()) {
      case "EASY":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Easy
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            Medium
          </span>
        );
      case "HARD":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            Hard
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            {diff || "Medium"}
          </span>
        );
    }
  };

  // Platform source badge
  const getSourceBadge = (source, link) => {
    const s = source?.toUpperCase() || (link?.includes("leetcode") ? "LEETCODE" : link?.includes("geeksforgeeks") ? "GFG" : "OTHER");
    if (s === "LEETCODE") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200/70" title="LeetCode Problem">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          LeetCode
        </span>
      );
    }
    if (s === "GFG") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200/70" title="GeeksforGeeks Problem">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
          GfG
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200" title="External Judge">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Problem
      </span>
    );
  };

  return (
    <div
      className={`group flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 transition-all duration-150 ${
        isDone
          ? "bg-slate-50/70 hover:bg-slate-100/60"
          : "bg-white hover:bg-indigo-50/30"
      }`}
    >
      {/* Left: Checkbox + Title + Badges */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggleStatus(question.id, isDone ? "TODO" : "DONE")}
          disabled={isTogglingStatus}
          className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isDone
              ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 border border-emerald-600"
              : "border-2 border-slate-300 hover:border-[#070235] bg-white text-transparent hover:text-slate-300"
          }`}
          title={isDone ? "Mark as Todo" : "Mark as Done"}
          aria-label={isDone ? "Mark as Todo" : "Mark as Done"}
        >
          <Check className={`w-3.5 h-3.5 ${isDone ? "opacity-100 stroke-[3]" : "opacity-0"}`} />
        </button>

        {/* Title and notes preview */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-medium transition-colors ${
                isDone ? "text-slate-400 line-through" : "text-slate-800 hover:text-[#070235]"
              }`}
            >
              {question.title}
            </span>

            {/* Note badge */}
            {hasNotes && (
              <span
                onClick={() => onOpenNotes(question)}
                className="inline-flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                title="View your personal note"
              >
                <StickyNote className="w-2.5 h-2.5" />
                Note
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Difficulty + Source + Notes Icon + Bookmark Star + Solve Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Source Badge */}
        <div className="hidden sm:block">
          {getSourceBadge(question.source, question.link)}
        </div>

        {/* Difficulty Badge */}
        <div className="shrink-0">
          {getDifficultyBadge(question.difficulty)}
        </div>

        {/* Notes Button */}
        <button
          type="button"
          onClick={() => onOpenNotes(question)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            hasNotes
              ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
              : "text-slate-300 hover:text-slate-600 hover:bg-slate-100"
          }`}
          title={hasNotes ? "Edit note" : "Add note"}
          aria-label="Notes"
        >
          <StickyNote className="w-4 h-4" />
        </button>

        {/* Bookmark Star */}
        <button
          type="button"
          onClick={() => onToggleBookmark(question.id, !isBookmarked)}
          disabled={isTogglingBookmark}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isBookmarked
              ? "text-amber-500 hover:text-amber-600 bg-amber-50"
              : "text-slate-300 hover:text-amber-500 hover:bg-amber-50/50"
          }`}
          title={isBookmarked ? "Remove from Revision list" : "Bookmark for Revision"}
          aria-label="Bookmark"
        >
          <Star className={`w-4 h-4 ${isBookmarked ? "fill-amber-400 text-amber-500" : ""}`} />
        </button>

        {/* Solve Link Button */}
        <a
          href={question.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#070235] bg-slate-100 hover:bg-[#070235] hover:text-white transition-all shadow-2xs group-hover:border-slate-300"
          title={`Solve ${question.title} in new tab`}
        >
          <span>Solve</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default QuestionRow;
