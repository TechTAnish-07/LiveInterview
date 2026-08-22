import React, { useState, useEffect, useCallback } from "react";
import api from "../Axios";
import ReactMarkdown from "react-markdown";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code2,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from "lucide-react";

const TOPICS = [
  "array",
  "String",
  "greedy",
  "DP",
  "graph",
  "Backend",
  "System_design",
];

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

const emptyQuestionForm = {
  title: "",
  topic: "array",
  difficulty: "MEDIUM",
  description: "",
  constraints: "",
  exampleInput: "",
  exampleOutput: "",
};

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState(emptyQuestionForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page,
        size: 8,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedTopic) params.topic = selectedTopic;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;

      const res = await api.get("/api/practiceQuestions", { params });

      if (res.data && res.data.content) {
        setQuestions(res.data.content);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      } else if (Array.isArray(res.data)) {
        setQuestions(res.data);
        setTotalPages(1);
        setTotalElements(res.data.length);
      }
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      setError("Failed to load question bank. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedTopic, selectedDifficulty]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleOpenAdd = () => {
    setFormData(emptyQuestionForm);
    setFormError("");
    setPreviewMode(false);
    setShowAddModal(true);
  };

  const handleOpenEdit = (question) => {
    setSelectedQuestion(question);
    setFormData({
      title: question.title || "",
      topic: question.topic || "array",
      difficulty: question.difficulty || "MEDIUM",
      description: question.description || "",
      constraints: question.constraints || "",
      exampleInput: question.exampleInput || "",
      exampleOutput: question.exampleOutput || "",
    });
    setFormError("");
    setPreviewMode(false);
    setShowEditModal(true);
  };

  const handleOpenDelete = (question) => {
    setSelectedQuestion(question);
    setShowDeleteModal(true);
  };

  const handleOpenView = (question) => {
    setSelectedQuestion(question);
    setShowViewModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError("Title and description are required.");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError("");
      await api.post("/api/question/add", formData);
      setShowAddModal(false);
      fetchQuestions();
    } catch (err) {
      console.error("Failed to add question:", err);
      setFormError(err.response?.data?.message || "Failed to add question.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError("Title and description are required.");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError("");
      await api.put(`/api/question/${selectedQuestion.id}`, formData);
      setShowEditModal(false);
      fetchQuestions();
    } catch (err) {
      console.error("Failed to update question:", err);
      setFormError(err.response?.data?.message || "Failed to update question.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQuestion) return;
    try {
      setFormSubmitting(true);
      await api.delete(`/api/question/${selectedQuestion.id}`);
      setShowDeleteModal(false);
      fetchQuestions();
    } catch (err) {
      console.error("Failed to delete question:", err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "HARD":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      case "MEDIUM":
      default:
        return "bg-amber-50 text-amber-700 border border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans pb-16">
      {/* Top Banner / Header */}
      <div className="bg-white border-b border-[#e0e3e5] px-6 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0058be] bg-[#d8e2ff] px-2.5 py-0.5 rounded-full">
                Admin Controls
              </span>
              <span className="text-xs font-mono text-[#787680]">
                {totalElements} Problems Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#070235] tracking-tight">
              Question Bank Management
            </h1>
            <p className="text-xs text-[#47464f] mt-1">
              Author, edit, filter, and maintain standard coding challenges used for candidate practice and technical interview rooms.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-[#89f5e7]" />
            <span>Add New Question</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white border border-[#e0e3e5] rounded-2xl p-4 md:p-5 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#787680] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by problem title or keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-xl focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[#191c1e]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Topic Filter */}
            <div className="flex items-center gap-1.5 bg-[#f7f9fb] border border-[#c8c5d0] px-3 py-1.5 rounded-xl text-xs">
              <Layers className="w-3.5 h-3.5 text-[#0058be]" />
              <select
                value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value);
                  setPage(0);
                }}
                className="bg-transparent focus:outline-none text-[#191c1e] text-xs font-medium cursor-pointer"
              >
                <option value="">All Topics</option>
                {TOPICS.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1.5 bg-[#f7f9fb] border border-[#c8c5d0] px-3 py-1.5 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-[#0058be]" />
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setPage(0);
                }}
                className="bg-transparent focus:outline-none text-[#191c1e] text-xs font-medium cursor-pointer"
              >
                <option value="">All Difficulties</option>
                {DIFFICULTIES.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>

            {(search || selectedTopic || selectedDifficulty) && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedTopic("");
                  setSelectedDifficulty("");
                  setPage(0);
                }}
                className="px-3 py-1.5 text-xs text-[#0058be] hover:bg-[#d8e2ff]/50 rounded-xl font-medium transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-[#ffdad6] text-[#93000a] text-xs font-medium rounded-xl border border-[#ba1a1a]/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Questions Data Table */}
        <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#787680] font-mono">
              <div className="w-8 h-8 border-3 border-[#0058be] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Loading question bank...
            </div>
          ) : questions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-[#f2f4f6] text-[#787680] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#070235]">No questions found</h3>
              <p className="text-xs text-[#47464f] mt-1 max-w-sm mx-auto">
                No questions match your filter criteria or the bank is currently empty.
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-4 px-4 py-2 bg-[#070235] text-white rounded-lg text-xs font-semibold hover:bg-[#1e1b4b] transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#89f5e7]" />
                Add First Question
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f7f9fb] border-b border-[#e0e3e5] text-[#47464f] font-mono uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-6 font-bold"># ID</th>
                    <th className="py-3.5 px-6 font-bold">Title & Description</th>
                    <th className="py-3.5 px-6 font-bold">Topic</th>
                    <th className="py-3.5 px-6 font-bold">Difficulty</th>
                    <th className="py-3.5 px-6 font-bold">Created Date</th>
                    <th className="py-3.5 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e3e5]">
                  {questions.map((q) => (
                    <tr
                      key={q.id}
                      className="hover:bg-[#f7f9fb]/60 transition-colors group"
                    >
                      <td className="py-4 px-6 font-mono text-[11px] text-[#787680]">
                        #{q.id}
                      </td>

                      <td className="py-4 px-6 max-w-md">
                        <div className="font-bold text-[#070235] text-sm line-clamp-1 group-hover:text-[#0058be] transition-colors">
                          {q.title}
                        </div>
                        <div className="text-[#47464f] text-[11px] line-clamp-1 mt-0.5">
                          {q.description}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#eceef0] text-[#191c1e] font-mono text-[10px] font-semibold">
                          {q.topic || "general"}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${getDifficultyBadge(
                            q.difficulty
                          )}`}
                        >
                          {q.difficulty || "MEDIUM"}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono text-[11px] text-[#787680]">
                        {q.createTime
                          ? new Date(q.createTime).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenView(q)}
                            className="p-1.5 rounded-lg text-[#0058be] hover:bg-[#d8e2ff]/50 transition-colors cursor-pointer"
                            title="Preview Question"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(q)}
                            className="p-1.5 rounded-lg text-[#070235] hover:bg-[#eceef0] transition-colors cursor-pointer"
                            title="Edit Question"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(q)}
                            className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/60 transition-colors cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[#e0e3e5] bg-[#f7f9fb] flex items-center justify-between">
              <span className="text-xs font-mono text-[#787680]">
                Page {page + 1} of {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg border border-[#c8c5d0] bg-white text-[#191c1e] hover:bg-[#eceef0] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg border border-[#c8c5d0] bg-white text-[#191c1e] hover:bg-[#eceef0] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Question Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 bg-[#070235]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-[#e0e3e5] rounded-2xl shadow-2xl overflow-hidden transition-all my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-[#070235] text-white flex items-center justify-between border-b border-[#1e1b4b]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2170e4] flex items-center justify-center text-white">
                  {showAddModal ? (
                    <Plus className="w-5 h-5" />
                  ) : (
                    <Edit2 className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">
                    {showAddModal ? "Create Practice Problem" : `Edit Problem #${selectedQuestion?.id}`}
                  </h3>
                  <span className="text-[10px] font-mono text-[#8683ba]">
                    Standardized interview & practice bank
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="p-1 rounded-lg text-[#8683ba] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form
              onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-left"
            >
              {formError && (
                <div className="p-3 bg-[#ffdad6] text-[#93000a] text-xs font-medium rounded-lg border border-[#ba1a1a]/20">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-[#191c1e] block">
                  Problem Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Two Sum Optimized, Lowest Common Ancestor"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[#191c1e]"
                />
              </div>

              {/* Topic & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-[#191c1e] block">
                    Topic Category
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] text-[#191c1e] cursor-pointer"
                  >
                    {TOPICS.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-[#191c1e] block">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] text-[#191c1e] cursor-pointer"
                  >
                    {DIFFICULTIES.map((diff) => (
                      <option key={diff} value={diff}>
                        {diff}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description with Preview toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-[#191c1e]">
                    Problem Description (Markdown Supported) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="text-[11px] font-mono text-[#0058be] hover:underline cursor-pointer"
                  >
                    {previewMode ? "Edit Markdown" : "Preview Markdown"}
                  </button>
                </div>

                {previewMode ? (
                  <div className="min-h-[140px] max-h-[220px] overflow-y-auto p-3 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg prose prose-sm max-w-none">
                    <ReactMarkdown>{formData.description || "*No description provided yet.*"}</ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    rows={5}
                    placeholder="Write a clear statement of the problem, input format, and output format..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[#191c1e] font-mono"
                  />
                )}
              </div>

              {/* Constraints */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-[#191c1e] block">
                  Constraints
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., 1 <= nums.length <= 10^5, -10^9 <= target <= 10^9"
                  value={formData.constraints}
                  onChange={(e) =>
                    setFormData({ ...formData, constraints: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] text-[#191c1e] font-mono"
                />
              </div>

              {/* Examples */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-[#191c1e] block">
                    Example Input
                  </label>
                  <textarea
                    rows={3}
                    placeholder="nums = [2,7,11,15], target = 9"
                    value={formData.exampleInput}
                    onChange={(e) =>
                      setFormData({ ...formData, exampleInput: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] text-[#191c1e] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-[#191c1e] block">
                    Example Output
                  </label>
                  <textarea
                    rows={3}
                    placeholder="[0, 1]"
                    value={formData.exampleOutput}
                    onChange={(e) =>
                      setFormData({ ...formData, exampleOutput: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] text-[#191c1e] font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#e0e3e5]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="flex-1 py-2.5 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#191c1e] rounded-lg font-semibold text-xs transition-all border border-[#c8c5d0]/50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 py-2.5 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-lg font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <span>Saving Problem...</span>
                  ) : (
                    <span>{showAddModal ? "Save to Question Bank" : "Update Problem"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-[#070235]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#e0e3e5] rounded-2xl shadow-2xl p-6 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="w-10 h-10 bg-[#ffdad6] text-[#ba1a1a] rounded-xl flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-[#070235]">
              Delete Practice Question?
            </h3>
            <p className="text-xs text-[#47464f] mt-1.5 leading-relaxed">
              Are you sure you want to permanently remove{" "}
              <strong className="text-[#191c1e]">"{selectedQuestion.title}"</strong> (ID #{selectedQuestion.id})? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#191c1e] rounded-lg font-semibold text-xs transition-all border border-[#c8c5d0]/50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={formSubmitting}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-lg font-semibold text-xs transition-all shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {formSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-[#070235]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-[#e0e3e5] rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#070235] text-white flex items-center justify-between border-b border-[#1e1b4b]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase ${getDifficultyBadge(
                      selectedQuestion.difficulty
                    )}`}
                  >
                    {selectedQuestion.difficulty}
                  </span>
                  <span className="text-[10px] font-mono text-[#8683ba]">
                    {selectedQuestion.topic || "general"}
                  </span>
                </div>
                <h3 className="font-bold text-sm tracking-tight">
                  {selectedQuestion.title}
                </h3>
              </div>

              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 rounded-lg text-[#8683ba] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs text-[#191c1e]">
              <div>
                <span className="font-mono font-semibold text-[#787680] text-[11px] uppercase block mb-1">
                  Description
                </span>
                <div className="prose prose-sm max-w-none text-[#191c1e] bg-[#f7f9fb] p-3 rounded-lg border border-[#e0e3e5]">
                  <ReactMarkdown>{selectedQuestion.description || "No description provided."}</ReactMarkdown>
                </div>
              </div>

              {selectedQuestion.constraints && (
                <div>
                  <span className="font-mono font-semibold text-[#787680] text-[11px] uppercase block mb-1">
                    Constraints
                  </span>
                  <div className="font-mono bg-[#f7f9fb] p-3 rounded-lg border border-[#e0e3e5] whitespace-pre-wrap">
                    {selectedQuestion.constraints}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedQuestion.exampleInput && (
                  <div>
                    <span className="font-mono font-semibold text-[#787680] text-[11px] uppercase block mb-1">
                      Example Input
                    </span>
                    <pre className="bg-[#1e1b4b] text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                      {selectedQuestion.exampleInput}
                    </pre>
                  </div>
                )}

                {selectedQuestion.exampleOutput && (
                  <div>
                    <span className="font-mono font-semibold text-[#787680] text-[11px] uppercase block mb-1">
                      Example Output
                    </span>
                    <pre className="bg-[#1e1b4b] text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                      {selectedQuestion.exampleOutput}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#f7f9fb] border-t border-[#e0e3e5] flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-[#070235] text-white rounded-lg text-xs font-semibold hover:bg-[#1e1b4b] transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;
