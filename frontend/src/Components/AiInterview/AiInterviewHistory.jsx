import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Axios";
import { Bot, Calendar, Clock, FileText, ArrowRight, Loader2, AlertCircle, ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";

export default function AiInterviewHistory() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/ai-interview/history");
      if (res.status === 200 && Array.isArray(res.data)) {
        setSessions(res.data);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error("Error fetching AI interview history:", err);
      setError(err.response?.data?.message || "Failed to load AI interview history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
        <span className="px-2.5 py-0.5 bg-[#89f5e7]/30 text-[#005049] border border-[#89f5e7]/60 rounded-full text-[11px] font-mono font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Completed</span>
        </span>
      );
    }
    if (s.includes("PROGRESS") || s.includes("LIVE")) {
      return (
        <span className="px-2.5 py-0.5 bg-[#d8e2ff] text-[#004395] border border-[#004395]/20 rounded-full text-[11px] font-mono font-bold">
          In Progress
        </span>
      );
    }
    if (s.includes("ENDED") || s.includes("CLOSED")) {
      return (
        <span className="px-2.5 py-0.5 bg-[#fff8f0] text-[#9c4b00] border border-[#f5d0a9] rounded-full text-[11px] font-mono font-bold">
          {s.replace("_", " ")}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 bg-[#f2f4f6] text-[#47464f] border border-[#e0e3e5] rounded-full text-[11px] font-mono font-bold">
        {s || "Created"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans pb-16">
      
      {/* Top Header */}
      <div className="bg-white border-b border-[#e0e3e5] px-6 md:px-12 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              to="/dashboard/candidate"
              className="inline-flex items-center gap-1.5 text-xs text-[#0058be] hover:underline font-semibold mb-3 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Candidate Dashboard</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#070235] tracking-tight flex items-center gap-3">
              <Bot className="w-7 h-7 text-[#0058be]" />
              <span>AI Mock Interview History</span>
            </h1>
            <p className="text-xs text-[#47464f] mt-1">
              Review your past 1:1 voice evaluation sessions, duration tracking, and detailed feedback reports.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="p-2.5 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#191c1e] rounded-xl text-xs font-semibold transition-all border border-[#c8c5d0] cursor-pointer"
              title="Refresh History"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <Link
              to="/ai-interview"
              className="px-5 py-2.5 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Start New AI Interview</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-8 space-y-6">

        {error && (
          <div className="p-4 bg-[#ffdad6] text-[#93000a] text-xs font-medium rounded-xl border border-[#ba1a1a]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-[11px] underline font-bold cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e0e3e5] p-12 text-center shadow-xs">
            <Loader2 className="w-8 h-8 text-[#0058be] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#070235]">Loading your AI interview history...</p>
          </div>
        ) : sessions.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-[#e0e3e5] p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#d8e2ff] text-[#0058be] flex items-center justify-center mx-auto">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#070235]">No AI Mock Interviews Conducted Yet</h3>
              <p className="text-xs text-[#787680] mt-1 max-w-md mx-auto leading-relaxed">
                Take a 1:1 voice AI technical interview customized to your uploaded resume skills and receive immediate actionable feedback.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/ai-interview"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <span>Launch First AI Mock Session</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Sessions History Table / List */
          <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#e0e3e5] flex items-center justify-between">
              <h2 className="text-base font-bold text-[#070235]">Past Interview Evaluations</h2>
              <span className="text-xs font-mono font-semibold bg-[#f2f4f6] px-3 py-1 rounded-full text-[#47464f]">
                {sessions.length} Total {sessions.length === 1 ? "Session" : "Sessions"}
              </span>
            </div>

            <div className="divide-y divide-[#e0e3e5]">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="p-5 hover:bg-[#f7f9fb] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-sm font-bold text-[#070235] flex items-center gap-2">
                        <Bot className="w-4 h-4 text-[#0058be]" />
                        <span>{session.jobTitle || "Software Engineer"}</span>
                      </h3>
                      {getStatusBadge(session.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#787680] font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#0058be]" />
                        <span>Date: {formatDate(session.startedAt || session.createdAt)}</span>
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#0058be]" />
                        <span>Duration: {formatDuration(session.durationSeconds)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {session.hasFeedback ? (
                      <Link
                        to={`/ai-interview/history/${session.sessionId}`}
                        className="px-4 py-2 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Feedback Report</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="px-3.5 py-1.5 bg-[#f2f4f6] text-[#787680] rounded-xl text-xs font-medium border border-[#e0e3e5]">
                        No feedback available
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
