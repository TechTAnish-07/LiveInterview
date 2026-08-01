import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../Axios";
import CreateInterview from "../InterviewRoom/CreateInterview";
import History from "./History";
import { Plus, Video, Users, CheckCircle2, Clock, Calendar, Copy, Share2, ArrowUpRight } from "lucide-react";

const HRDashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/hr/schedule");
      setInterviews(res.data || []);
    } catch (error) {
      console.error("Error fetching HR schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleInterviewCreated = (newInterview) => {
    setInterviews((prev) => [...prev, newInterview]);
    setShowCreateModal(false);
  };

  const now = new Date();

  const upcomingInterviews = interviews.filter((i) => {
    return (
      (i.status === "SCHEDULED" || i.status === "LIVE") &&
      new Date(i.endTime) >= now
    );
  });

  const completedCount = interviews.filter((i) => i.status === "COMPLETED").length;
  const liveCount = interviews.filter((i) => i.status === "LIVE").length;

  const getInterviewUrl = (meetingLink) => {
    return `${window.location.origin}/prejoin/${meetingLink}`;
  };

  const shareOnWhatsApp = (meetingLink) => {
    const interviewUrl = getInterviewUrl(meetingLink);
    const message = `Hi! You are invited to join your LiveInterview technical session.\n\nJoin link: ${interviewUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const copyLink = async (meetingLink, interviewId) => {
    const interviewUrl = getInterviewUrl(meetingLink);
    try {
      await navigator.clipboard.writeText(interviewUrl);
      setCopiedId(interviewId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
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
                HR Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#070235] tracking-tight">
              Recruiter & Evaluation Dashboard
            </h1>
            <p className="text-xs text-[#47464f] mt-1">
              Manage live technical sessions, schedule candidates, and inspect AI evaluation reports.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-[#89f5e7]" />
            <span>Create New Interview</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 space-y-8">
        
        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-[#47464f] uppercase tracking-wider block mb-1">Total Scheduled</span>
              <span className="text-2xl font-extrabold text-[#070235]">{interviews.length}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#e3dfff] text-[#070235] flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-[#47464f] uppercase tracking-wider block mb-1">Live Right Now</span>
              <span className="text-2xl font-extrabold text-[#0058be]">{liveCount}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#d8e2ff] text-[#0058be] flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-[#47464f] uppercase tracking-wider block mb-1">Completed</span>
              <span className="text-2xl font-extrabold text-[#1a998d]">{completedCount}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#89f5e7]/40 text-[#005049] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-[#47464f] uppercase tracking-wider block mb-1">Active Candidates</span>
              <span className="text-2xl font-extrabold text-[#070235]">{upcomingInterviews.length}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#eceef0] text-[#191c1e] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Upcoming Interviews Quick Action Grid */}
        <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-[#070235]">Upcoming & Active Technical Sessions</h2>
              <p className="text-xs text-[#47464f]">Launch room or share meeting invitation links</p>
            </div>
            <span className="text-xs font-mono bg-[#f2f4f6] px-3 py-1 rounded-full text-[#070235] font-semibold">
              {upcomingInterviews.length} Scheduled
            </span>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div className="text-center py-12 bg-[#f7f9fb] rounded-xl border border-dashed border-[#c8c5d0]">
              <Calendar className="w-8 h-8 text-[#787680] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#191c1e]">No upcoming interviews scheduled</p>
              <p className="text-[11px] text-[#47464f] mt-1">Click "Create New Interview" above to invite candidates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingInterviews.map((i) => (
                <div key={i.interviewId} className="bg-[#f7f9fb] border border-[#e0e3e5] hover:border-[#0058be] rounded-xl p-5 transition-all shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        i.status === "LIVE" 
                          ? "bg-[#ffdad6] text-[#93000a] animate-pulse" 
                          : "bg-[#d8e2ff] text-[#004395]"
                      }`}>
                        {i.status}
                      </span>
                      <span className="text-[11px] font-mono text-[#787680]">ID #{i.interviewId}</span>
                    </div>

                    <h3 className="font-bold text-sm text-[#070235] mb-2 truncate" title={i.candidateEmail}>
                      {i.candidateEmail}
                    </h3>

                    <div className="space-y-1 text-xs text-[#47464f] font-mono bg-white p-2.5 rounded-lg border border-[#c8c5d0]/50 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#0058be]" />
                        <span>Start: {new Date(i.startTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#787680]">
                        <span>End: {new Date(i.endTime).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {i.meetingLink && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[#e0e3e5]">
                      <Link
                        to={`/prejoin/${i.meetingLink}`}
                        className="flex-1 py-2 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-lg text-xs font-semibold text-center transition-all flex items-center justify-center gap-1"
                      >
                        <span>Join Room</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => shareOnWhatsApp(i.meetingLink)}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-all border border-emerald-200"
                        title="Share via WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => copyLink(i.meetingLink, i.interviewId)}
                        className="p-2 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#191c1e] rounded-lg text-xs font-semibold transition-all border border-[#c8c5d0]"
                        title="Copy Invitation Link"
                      >
                        {copiedId === i.interviewId ? "Copied" : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History Table Section */}
        <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 shadow-xs">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-[#070235]">Evaluation History & Reports</h2>
            <p className="text-xs text-[#47464f]">Review completed interview scores, playback notes, and feedback reports.</p>
          </div>

          <History />
        </div>

      </div>

      {/* Modal */}
      {showCreateModal && (
        <CreateInterview
          onSuccess={handleInterviewCreated}
          onClose={() => setShowCreateModal(false)}
        />
      )}

    </div>
  );
};

export default HRDashboard;