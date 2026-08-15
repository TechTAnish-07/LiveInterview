import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import api from "../Axios";
import { Bot, Calendar, Clock, FileText, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Download, ExternalLink, Sparkles, MessageSquare } from "lucide-react";

export default function AiInterviewDetail() {
  const { sessionId } = useParams();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/ai-interview/${sessionId}/detail`);
        if (res.status === 200 && res.data) {
          setDetail(res.data);
        } else {
          setDetail(null);
        }
      } catch (err) {
        console.error("Error fetching AI interview detail:", err);
        const msg = err.response?.data?.message || "Failed to load interview session details.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchDetail();
    }
  }, [sessionId]);

  const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined || seconds < 0) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    if (s.includes("COMPLETED")) {
      return (
        <span className="px-3 py-1 bg-[#89f5e7]/30 text-[#005049] border border-[#89f5e7]/60 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed</span>
        </span>
      );
    }
    if (s.includes("PROGRESS") || s.includes("LIVE")) {
      return (
        <span className="px-3 py-1 bg-[#d8e2ff] text-[#004395] border border-[#004395]/20 rounded-full text-xs font-mono font-bold">
          In Progress
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-[#f2f4f6] text-[#47464f] border border-[#e0e3e5] rounded-full text-xs font-mono font-bold">
        {s || "Created"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans pb-16">
      
      {/* Top Header */}
      <div className="bg-white border-b border-[#e0e3e5] px-6 md:px-12 py-8">
        <div className="max-w-5xl mx-auto space-y-3">
          <Link
            to="/ai-interview/history"
            className="inline-flex items-center gap-1.5 text-xs text-[#0058be] hover:underline font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to AI Interview History</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0058be] bg-[#d8e2ff] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Mock Evaluation Report</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#070235] tracking-tight">
                {detail?.jobTitle || "Software Engineer"} Session Report
              </h1>
            </div>

            {detail && getStatusBadge(detail.status)}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-8 space-y-6">

        {error && (
          <div className="p-4 bg-[#ffdad6] text-[#93000a] text-xs font-medium rounded-xl border border-[#ba1a1a]/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e0e3e5] p-12 text-center shadow-xs">
            <Loader2 className="w-8 h-8 text-[#0058be] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#070235]">Loading session evaluation details...</p>
          </div>
        ) : detail ? (
          <div className="space-y-6">

            {/* Session Metadata Summary Card */}
            <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-[#787680] uppercase tracking-wider block">Date Conducted</span>
                <p className="text-xs font-bold text-[#070235] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#0058be]" />
                  <span>{formatDate(detail.startedAt || detail.createdAt)}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-[#787680] uppercase tracking-wider block">Duration</span>
                <p className="text-xs font-bold text-[#070235] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#0058be]" />
                  <span>{formatDuration(detail.durationSeconds)}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-[#787680] uppercase tracking-wider block">Verified Resume PDF</span>
                {detail.resumeFileUrl ? (
                  <a
                    href={detail.resumeFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#0058be] hover:underline flex items-center gap-1"
                  >
                    <span>View Uploaded Resume</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <p className="text-xs text-[#787680] italic">Not attached</p>
                )}
              </div>
            </div>

            {/* Main Feedback Report Container */}
            <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-xs overflow-hidden">
              <div className="p-6 bg-[#070235] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-[#89f5e7] flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">AI Technical Feedback Report</h2>
                    <p className="text-xs text-[#8683ba]">Generated by AI Evaluator following full session transcript analysis</p>
                  </div>
                </div>

                {detail.hasFeedback && (
                  <span className="text-xs font-mono font-bold bg-[#89f5e7]/20 text-[#89f5e7] px-3 py-1 rounded-full border border-[#89f5e7]/40 hidden sm:inline">
                    Verified Feedback
                  </span>
                )}
              </div>

              <div className="p-6 md:p-8">
                {detail.feedback ? (
                  <div className="bg-[#f7f9fb] p-6 rounded-xl border border-[#e0e3e5]">
                    <ReactMarkdown
                      components={{
                        h2: ({ node, ...props }) => (
                          <h2 className="text-sm font-extrabold text-[#070235] uppercase tracking-wide border-b border-[#e0e3e5] pb-1.5 mt-6 mb-3 first:mt-0" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-xs font-bold text-[#0058be] mt-4 mb-2" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="text-xs text-[#191c1e] leading-relaxed mb-3 font-sans" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc list-inside text-xs text-[#191c1e] space-y-1.5 mb-4 pl-1" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal list-inside text-xs text-[#191c1e] space-y-1.5 mb-4 pl-1" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="leading-relaxed" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className="font-bold text-[#070235]" {...props} />
                        ),
                      }}
                    >
                      {detail.feedback}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-[#f7f9fb] rounded-xl border border-dashed border-[#c8c5d0] space-y-2">
                    <FileText className="w-8 h-8 text-[#787680] mx-auto" />
                    <h3 className="text-sm font-bold text-[#070235]">No Feedback Report Available</h3>
                    <p className="text-xs text-[#787680] max-w-md mx-auto">
                      This interview session ended before a complete feedback report was generated (e.g., early exit or resume mismatch).
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Optional Session Transcript Drawer */}
            {detail.transcript && (
              <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#070235] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#0058be]" />
                    <span>Session Transcript</span>
                  </h3>
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="text-xs font-semibold text-[#0058be] hover:underline cursor-pointer"
                  >
                    {showTranscript ? "Hide Transcript" : "Show Full Transcript"}
                  </button>
                </div>

                {showTranscript && (
                  <div className="p-4 bg-[#0f172a] text-slate-200 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed border border-slate-700">
                    {detail.transcript}
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e0e3e5] p-12 text-center shadow-xs">
            <AlertCircle className="w-8 h-8 text-[#ba1a1a] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#070235]">Session Not Found</p>
          </div>
        )}

      </div>
    </div>
  );
}
