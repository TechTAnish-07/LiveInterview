import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../Components/Axios";
import ProgressOverview from "./ProgressOverview";
import FilterBar from "./FilterBar";
import TopicAccordion from "./TopicAccordion";
import RevisionListPage from "./RevisionListPage";
import NotesModal from "./NotesModal";
import {
  Sparkles,
  Layers,
  Star,
  RefreshCw,
  AlertCircle,
  Code2,
  CheckCircle,
  ListTodo,
} from "lucide-react";

const DsaTrackerPage = () => {
  // Data states
  const [topicGroups, setTopicGroups] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active view tab: "roadmap" or "revision"
  const [activeTab, setActiveTab] = useState("roadmap");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  // Accordion open/close state: Map of topic name -> boolean
  const [expandedTopics, setExpandedTopics] = useState({});

  // Loading states for individual rows (optimistic locking indicators)
  const [statusLoadingMap, setStatusLoadingMap] = useState({});
  const [bookmarkLoadingMap, setBookmarkLoadingMap] = useState({});

  // Notes Modal state
  const [activeNoteQuestion, setActiveNoteQuestion] = useState(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [questionsRes, summaryRes] = await Promise.all([
        api.get("/api/dsa/questions"),
        api.get("/api/dsa/progress/summary"),
      ]);

      const groups = Array.isArray(questionsRes.data) ? questionsRes.data : [];
      setTopicGroups(groups);
      setSummary(summaryRes.data || null);

      // Default first 3 topics expanded or all if few
      const initialExpanded = {};
      groups.forEach((g, idx) => {
        initialExpanded[g.topic] = idx < 3;
      });
      setExpandedTopics(initialExpanded);
    } catch (err) {
      console.error("Failed to fetch DSA tracker data:", err);
      setError(err.response?.data?.message || err.message || "Failed to load DSA Tracker data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Recalculate summary helper
  const recalculateSummaryFromGroups = (groups) => {
    let total = 0;
    let done = 0;
    let inProgress = 0;
    let bookmarked = 0;
    let easyTotal = 0, easyDone = 0;
    let medTotal = 0, medDone = 0;
    let hardTotal = 0, hardDone = 0;

    const topicBreakdown = [];

    groups.forEach((g) => {
      let topicDone = 0;
      let topicInProg = 0;
      const topicTotal = g.questions?.length || 0;

      (g.questions || []).forEach((q) => {
        total++;
        const isD = q.status === "DONE";
        const isInP = q.status === "IN_PROGRESS";
        const isB = Boolean(q.bookmarked);

        if (isD) {
          done++;
          topicDone++;
        }
        if (isInP) {
          inProgress++;
          topicInProg++;
        }
        if (isB) bookmarked++;

        const diff = q.difficulty?.toUpperCase();
        if (diff === "EASY") {
          easyTotal++;
          if (isD) easyDone++;
        } else if (diff === "MEDIUM") {
          medTotal++;
          if (isD) medDone++;
        } else if (diff === "HARD") {
          hardTotal++;
          if (isD) hardDone++;
        }
      });

      topicBreakdown.push({
        topic: g.topic,
        topicOrder: g.topicOrder || 0,
        total: topicTotal,
        done: topicDone,
        inProgress: topicInProg,
      });
    });

    const completionPercentage = total > 0 ? Math.round(((done / total) * 100) * 10) / 10 : 0;

    return {
      totalQuestions: total,
      doneQuestions: done,
      inProgressQuestions: inProgress,
      todoQuestions: total - done - inProgress,
      bookmarkedQuestions: bookmarked,
      completionPercentage,
      topicBreakdown,
      difficultyBreakdown: {
        easy: { total: easyTotal, done: easyDone },
        medium: { total: medTotal, done: medDone },
        hard: { total: hardTotal, done: hardDone },
      },
    };
  };

  // Toggle question status (optimistic update)
  const handleToggleStatus = async (questionId, nextStatus) => {
    // Save previous state for rollback
    const previousGroups = JSON.parse(JSON.stringify(topicGroups));
    const previousSummary = summary;

    // Apply optimistic update
    const updatedGroups = topicGroups.map((group) => {
      let modified = false;
      const newQuestions = group.questions.map((q) => {
        if (q.id === questionId) {
          modified = true;
          return { ...q, status: nextStatus };
        }
        return q;
      });

      if (!modified) return group;

      const doneCount = newQuestions.filter((q) => q.status === "DONE").length;
      const inProgCount = newQuestions.filter((q) => q.status === "IN_PROGRESS").length;
      return {
        ...group,
        doneQuestions: doneCount,
        inProgressQuestions: inProgCount,
        questions: newQuestions,
      };
    });

    setTopicGroups(updatedGroups);
    setSummary(recalculateSummaryFromGroups(updatedGroups));
    setStatusLoadingMap((prev) => ({ ...prev, [questionId]: true }));

    try {
      await api.patch(`/api/dsa/progress/${questionId}`, { status: nextStatus });
    } catch (err) {
      console.error("Failed to update status on server:", err);
      // Rollback
      setTopicGroups(previousGroups);
      setSummary(previousSummary);
      alert("Failed to update status. Please check your connection.");
    } finally {
      setStatusLoadingMap((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // Toggle bookmark (optimistic update)
  const handleToggleBookmark = async (questionId, nextBookmarked) => {
    const previousGroups = JSON.parse(JSON.stringify(topicGroups));
    const previousSummary = summary;

    const updatedGroups = topicGroups.map((group) => ({
      ...group,
      questions: group.questions.map((q) =>
        q.id === questionId ? { ...q, bookmarked: nextBookmarked } : q
      ),
    }));

    setTopicGroups(updatedGroups);
    setSummary(recalculateSummaryFromGroups(updatedGroups));
    setBookmarkLoadingMap((prev) => ({ ...prev, [questionId]: true }));

    try {
      await api.patch(`/api/dsa/progress/${questionId}/bookmark`, { bookmarked: nextBookmarked });
    } catch (err) {
      console.error("Failed to update bookmark on server:", err);
      setTopicGroups(previousGroups);
      setSummary(previousSummary);
      alert("Failed to update bookmark. Please try again.");
    } finally {
      setBookmarkLoadingMap((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // Save notes
  const handleSaveNotes = async (questionId, notes) => {
    await api.patch(`/api/dsa/progress/${questionId}/notes`, { notes });
    setTopicGroups((prevGroups) =>
      prevGroups.map((group) => ({
        ...group,
        questions: group.questions.map((q) =>
          q.id === questionId ? { ...q, notes } : q
        ),
      }))
    );
  };

  // Open Notes Modal
  const handleOpenNotes = (question) => {
    setActiveNoteQuestion(question);
    setIsNotesModalOpen(true);
  };

  // Expand / Collapse a single topic
  const handleToggleExpand = (topicName) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicName]: !prev[topicName],
    }));
  };

  // Expand / Collapse all topics
  const allExpanded = useMemo(() => {
    if (topicGroups.length === 0) return false;
    return topicGroups.every((g) => expandedTopics[g.topic]);
  }, [topicGroups, expandedTopics]);

  const handleToggleAllExpanded = () => {
    const nextState = !allExpanded;
    const updated = {};
    topicGroups.forEach((g) => {
      updated[g.topic] = nextState;
    });
    setExpandedTopics(updated);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setDifficultyFilter("ALL");
    setStatusFilter("ALL");
    setBookmarkedOnly(false);
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    difficultyFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    bookmarkedOnly;

  // Filtered topics and questions
  const filteredTopicGroups = useMemo(() => {
    return topicGroups
      .map((group) => {
        const matchingQuestions = group.questions.filter((q) => {
          // Difficulty filter
          if (difficultyFilter !== "ALL" && q.difficulty?.toUpperCase() !== difficultyFilter) {
            return false;
          }
          // Status filter
          if (statusFilter !== "ALL" && q.status?.toUpperCase() !== statusFilter) {
            return false;
          }
          // Bookmarked filter
          if (bookmarkedOnly && !q.bookmarked) {
            return false;
          }
          // Search filter
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const matchTitle = q.title.toLowerCase().includes(query);
            const matchTopic = q.topic.toLowerCase().includes(query);
            if (!matchTitle && !matchTopic) {
              return false;
            }
          }
          return true;
        });

        return {
          ...group,
          questions: matchingQuestions,
        };
      })
      .filter((group) => group.questions.length > 0 || !hasActiveFilters);
  }, [topicGroups, difficultyFilter, statusFilter, bookmarkedOnly, searchQuery, hasActiveFilters]);

  // All bookmarked questions across topics
  const allBookmarkedQuestions = useMemo(() => {
    const list = [];
    topicGroups.forEach((g) => {
      (g.questions || []).forEach((q) => {
        if (q.bookmarked) {
          list.push(q);
        }
      });
    });
    return list;
  }, [topicGroups]);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header & Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#070235] text-white flex items-center justify-center shadow-md">
                <Code2 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                DSA Question Tracker
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Master Data Structures & Algorithms topic by topic with curated LeetCode & GfG challenges.
            </p>
          </div>

          {/* View Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab("roadmap")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "roadmap"
                  ? "bg-[#070235] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sheet Roadmap</span>
            </button>

            <button
              onClick={() => setActiveTab("revision")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "revision"
                  ? "bg-[#070235] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${activeTab === "revision" ? "fill-amber-400 text-amber-400" : "text-amber-500"}`} />
              <span>Revision List</span>
              {allBookmarkedQuestions.length > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === "revision"
                      ? "bg-amber-400 text-slate-900"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {allBookmarkedQuestions.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Loading State Skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-44 bg-slate-200/80 rounded-2xl"></div>
            <div className="h-16 bg-slate-200/80 rounded-xl"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-200/80 rounded-xl"></div>
              ))}
            </div>
          </div>
        )}

        {/* Error State Banner */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Failed to load DSA Tracker</h4>
                <p className="text-xs text-rose-600 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Main Content when loaded */}
        {!loading && !error && (
          <>
            {/* Header Metrics Card */}
            <ProgressOverview summary={summary} />

            {/* TAB 1: SHEET ROADMAP */}
            {activeTab === "roadmap" && (
              <>
                {/* Search & Filter Controls */}
                <FilterBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  difficultyFilter={difficultyFilter}
                  onDifficultyChange={setDifficultyFilter}
                  statusFilter={statusFilter}
                  onStatusChange={setStatusFilter}
                  bookmarkedOnly={bookmarkedOnly}
                  onBookmarkedOnlyChange={setBookmarkedOnly}
                  onToggleAllExpanded={handleToggleAllExpanded}
                  allExpanded={allExpanded}
                  onResetFilters={handleResetFilters}
                  hasActiveFilters={hasActiveFilters}
                />

                {/* Topic Accordions */}
                <div className="space-y-3">
                  {filteredTopicGroups.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                      <ListTodo className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                      <h3 className="text-sm font-bold text-slate-800">No questions found</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        No questions matched your active filter criteria. Try adjusting your search query or filters.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#070235] hover:bg-[#150f55] transition-all shadow-sm"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    filteredTopicGroups.map((group) => (
                      <TopicAccordion
                        key={group.topic}
                        topicGroup={group}
                        isExpanded={Boolean(expandedTopics[group.topic])}
                        onToggleExpand={() => handleToggleExpand(group.topic)}
                        onToggleStatus={handleToggleStatus}
                        onToggleBookmark={handleToggleBookmark}
                        onOpenNotes={handleOpenNotes}
                        statusLoadingMap={statusLoadingMap}
                        bookmarkLoadingMap={bookmarkLoadingMap}
                      />
                    ))
                  )}
                </div>
              </>
            )}

            {/* TAB 2: REVISION LIST */}
            {activeTab === "revision" && (
              <RevisionListPage
                bookmarkedQuestions={allBookmarkedQuestions}
                onToggleStatus={handleToggleStatus}
                onToggleBookmark={handleToggleBookmark}
                onOpenNotes={handleOpenNotes}
                statusLoadingMap={statusLoadingMap}
                bookmarkLoadingMap={bookmarkLoadingMap}
                onBackToRoadmap={() => setActiveTab("roadmap")}
              />
            )}
          </>
        )}
      </div>

      {/* Personal Notes Modal */}
      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        question={activeNoteQuestion}
        onSave={handleSaveNotes}
      />
    </div>
  );
};

export default DsaTrackerPage;
