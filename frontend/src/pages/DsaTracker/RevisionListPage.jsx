import React, { useState } from "react";
import { Star, Search, ExternalLink, BookmarkCheck, ArrowLeft } from "lucide-react";
import QuestionRow from "./QuestionRow";

const RevisionListPage = ({
  bookmarkedQuestions = [],
  onToggleStatus,
  onToggleBookmark,
  onOpenNotes,
  statusLoadingMap = {},
  bookmarkLoadingMap = {},
  onBackToRoadmap,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQuestions = bookmarkedQuestions.filter((q) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return q.title.toLowerCase().includes(query) || q.topic.toLowerCase().includes(query);
  });

  const doneCount = bookmarkedQuestions.filter((q) => q.status === "DONE").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Revision List</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-100 text-amber-800">
                {bookmarkedQuestions.length} Questions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Your star-marked problems for quick repetition and last-minute interview prep ({doneCount} / {bookmarkedQuestions.length} completed).
            </p>
          </div>
        </div>

        {onBackToRoadmap && (
          <button
            onClick={onBackToRoadmap}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sheet Roadmap
          </button>
        )}
      </div>

      {/* Search inside revision */}
      {bookmarkedQuestions.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search within your bookmarked revision questions..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#070235]/15 focus:border-[#070235] bg-white placeholder-slate-400 text-slate-800"
          />
        </div>
      )}

      {/* Questions list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {bookmarkedQuestions.length === 0 ? (
          <div className="py-16 px-4 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">No bookmarked questions yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Click the star (⭐) icon next to any problem on the roadmap to save tricky or important questions here for fast revision before interviews.
            </p>
            {onBackToRoadmap && (
              <button
                onClick={onBackToRoadmap}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#070235] hover:bg-[#150f55] transition-all shadow-sm"
              >
                Browse Question Bank
              </button>
            )}
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 italic">
            No bookmarked questions match "{searchTerm}".
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredQuestions.map((question) => (
              <QuestionRow
                key={question.id}
                question={question}
                onToggleStatus={onToggleStatus}
                onToggleBookmark={onToggleBookmark}
                onOpenNotes={onOpenNotes}
                isTogglingStatus={Boolean(statusLoadingMap[question.id])}
                isTogglingBookmark={Boolean(bookmarkLoadingMap[question.id])}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RevisionListPage;
