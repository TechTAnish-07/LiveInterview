import React, { useState, useEffect } from "react";
import api from "../Axios";
import { X, Calendar, Clock, Mail, Plus, BookOpen, Layers } from "lucide-react";

const CreateInterview = ({ onSuccess, onClose }) => {
  const [candidateEmail, setCandidateEmail] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewStartTime, setInterviewStartTime] = useState("");
  const [interviewEndTime, setInterviewEndTime] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoadingQuestions(true);
        const res = await api.get("/api/practiceQuestions");
        if (Array.isArray(res.data)) {
          setAvailableQuestions(res.data);
        } else if (res.data && Array.isArray(res.data.content)) {
          setAvailableQuestions(res.data.content);
        }
      } catch (err) {
        console.error("Failed to load question bank for interview creation:", err);
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const startTime = `${interviewDate}T${interviewStartTime}:00`;
    const endTime = `${interviewDate}T${interviewEndTime}:00`;

    const payload = {
      candidateEmail,
      startTime,
      endTime,
      ...(selectedQuestionId ? { questionId: Number(selectedQuestionId) } : {}),
    };

    try {
      setLoading(true);
      const res = await api.post("/api/hr/createInterview", payload);
      onSuccess(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to schedule interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070235]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#e0e3e5] rounded-2xl shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#070235] text-white flex items-center justify-between border-b border-[#1e1b4b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2170e4] flex items-center justify-center text-white">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Schedule Technical Interview</h3>
              <span className="text-[10px] font-mono text-[#8683ba]">Generate room link for candidate</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8683ba] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          
          {error && (
            <div className="p-3 bg-[#ffdad6] text-[#93000a] text-xs font-medium rounded-lg border border-[#ba1a1a]/20">
              {error}
            </div>
          )}

          {/* Candidate Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-[#191c1e] block">
              Candidate Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#787680] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[#191c1e]"
                placeholder="candidate@company.com"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Interview Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-[#191c1e] block">
              Scheduled Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#787680] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[#191c1e]"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Time Slot */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-[#191c1e] block">
              Time Window (Start & End)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Clock className="w-4 h-4 text-[#787680] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[#191c1e]"
                  value={interviewStartTime}
                  onChange={(e) => setInterviewStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Clock className="w-4 h-4 text-[#787680] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 text-[#191c1e]"
                  value={interviewEndTime}
                  onChange={(e) => setInterviewEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Attach Question from Bank (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-[#191c1e] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#0058be]" />
                Attach Question from Bank (Optional)
              </label>
              <span className="text-[10px] text-[#787680] font-mono">
                Auto-loads in room
              </span>
            </div>
            <select
              value={selectedQuestionId}
              onChange={(e) => setSelectedQuestionId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#f7f9fb] border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] text-[#191c1e] cursor-pointer"
            >
              <option value="">-- No question attached (HR will type live) --</option>
              {availableQuestions.map((q) => (
                <option key={q.id} value={q.id}>
                  [{q.difficulty || "MED"}] {q.title} ({q.topic || "General"})
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#e0e3e5]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#191c1e] rounded-lg font-semibold text-xs transition-all border border-[#c8c5d0]/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-lg font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Generating...</span>
              ) : (
                <span>Schedule Session</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateInterview;