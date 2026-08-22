import React from "react";
import { ChevronDown, FolderCode, CheckCircle2 } from "lucide-react";
import QuestionRow from "./QuestionRow";

const TopicAccordion = ({
  topicGroup,
  isExpanded,
  onToggleExpand,
  onToggleStatus,
  onToggleBookmark,
  onOpenNotes,
  statusLoadingMap = {},
  bookmarkLoadingMap = {},
}) => {
  const { topic, totalQuestions, doneQuestions, questions = [] } = topicGroup;
  const percentage = totalQuestions > 0 ? Math.round((doneQuestions / totalQuestions) * 100) : 0;
  const isFullyCompleted = totalQuestions > 0 && doneQuestions === totalQuestions;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all duration-200 mb-3.5">
      {/* Header Button */}
      <button
        type="button"
        onClick={onToggleExpand}
        className={`w-full flex items-center justify-between px-4 sm:px-5 py-3.5 text-left transition-colors cursor-pointer select-none ${
          isExpanded ? "bg-slate-50/80 border-b border-slate-200/80" : "bg-white hover:bg-slate-50/60"
        }`}
        aria-expanded={isExpanded}
      >
        {/* Left: Icon + Topic Name + Question count */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isFullyCompleted
                ? "bg-emerald-100 text-emerald-700"
                : "bg-indigo-50 text-indigo-700"
            }`}
          >
            {isFullyCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <FolderCode className="w-4 h-4 text-[#070235]" />
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm text-slate-900 tracking-tight">
              {topic}
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({doneQuestions}/{totalQuestions})
            </span>
          </div>
        </div>

        {/* Right: Progress Bar + Percentage + Chevron */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Progress Bar (hidden on very small screens) */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-24 md:w-32 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isFullyCompleted
                    ? "bg-emerald-500"
                    : percentage > 50
                    ? "bg-indigo-600"
                    : "bg-blue-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span
              className={`text-xs font-mono font-semibold w-10 text-right ${
                isFullyCompleted
                  ? "text-emerald-600 font-bold"
                  : percentage > 0
                  ? "text-slate-700"
                  : "text-slate-400"
              }`}
            >
              {percentage}%
            </span>
          </div>

          {/* Chevron */}
          <div
            className={`p-1 rounded-md text-slate-400 hover:text-slate-600 transition-transform duration-200 ${
              isExpanded ? "rotate-180 text-slate-700" : ""
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Accordion Body */}
      {isExpanded && (
        <div className="divide-y divide-slate-100 animate-in fade-in-50 duration-150">
          {questions.length === 0 ? (
            <div className="px-5 py-6 text-center text-xs text-slate-400 italic">
              No questions matching active filters in this topic.
            </div>
          ) : (
            questions.map((question) => (
              <QuestionRow
                key={question.id}
                question={question}
                onToggleStatus={onToggleStatus}
                onToggleBookmark={onToggleBookmark}
                onOpenNotes={onOpenNotes}
                isTogglingStatus={Boolean(statusLoadingMap[question.id])}
                isTogglingBookmark={Boolean(bookmarkLoadingMap[question.id])}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TopicAccordion;
