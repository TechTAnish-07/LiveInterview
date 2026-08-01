import React, { useEffect, useState } from "react";
import CreateInterview from "../InterviewRoom/CreateInterview";
import api from "../Axios";
import { Link } from "react-router-dom";
import { Plus, Calendar, Clock, Share2, Copy, ArrowUpRight } from "lucide-react";

const InterviewSchedule = () => {
  const [showCreateInterview, setShowCreateInterview] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get("/api/hr/schedule");
        setInterviews(res.data || []);
      } catch (error) {
        console.error("Error fetching interview schedule:", error);
      }
    };

    fetchSchedule();
  }, []);

  const handleInterviewCreated = (newInterview) => {
    setInterviews((prev) => [...prev, newInterview]);
    setShowCreateInterview(false);
  };

  const now = new Date();

  const upcomingInterviews = interviews.filter((i) => {
    return (
      (i.status === "SCHEDULED" || i.status === "LIVE") &&
      new Date(i.endTime) >= now
    );
  });

  const getInterviewUrl = (meetingLink) => {
    return `${window.location.origin}/prejoin/${meetingLink}`;
  };

  const shareOnWhatsApp = (meetingLink) => {
    const interviewUrl = getInterviewUrl(meetingLink);
    const message = `Hi! You are invited to join the live technical interview.\n\nJoin link: ${interviewUrl}`;
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
      
      {/* Header */}
      <div className="bg-white border-b border-[#e0e3e5] px-6 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0058be] bg-[#d8e2ff] px-2.5 py-0.5 rounded-full">
                Session Manager
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#070235] tracking-tight">
              Interview Schedule
            </h1>
            <p className="text-xs text-[#47464f] mt-1">
              View upcoming sessions, generate meeting invites, and launch evaluation rooms.
            </p>
          </div>

          {!showCreateInterview && (
            <button
              onClick={() => setShowCreateInterview(true)}
              className="px-5 py-3 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#89f5e7]" />
              <span>Create Interview</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8">
        
        {showCreateInterview && (
          <CreateInterview
            onSuccess={handleInterviewCreated}
            onClose={() => setShowCreateInterview(false)}
          />
        )}

        <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-extrabold text-[#070235]">Upcoming Sessions</h2>
            <span className="text-xs font-mono bg-[#f2f4f6] px-3 py-1 rounded-full text-[#070235] font-semibold">
              {upcomingInterviews.length} Scheduled
            </span>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div className="text-center py-16 bg-[#f7f9fb] rounded-xl border border-dashed border-[#c8c5d0]">
              <Calendar className="w-10 h-10 text-[#787680] mx-auto mb-3" />
              <p className="text-sm font-bold text-[#191c1e]">No upcoming interviews scheduled</p>
              <p className="text-xs text-[#47464f] mt-1">Use the Create Interview button above to schedule candidate sessions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                    <div className="space-y-1 text-xs text-[#47464f] font-mono bg-white p-3 rounded-lg border border-[#c8c5d0]/50 mb-4">
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
                    <div className="flex items-center gap-2 pt-3 border-t border-[#e0e3e5]">
                      <Link
                        to={`/prejoin/${i.meetingLink}`}
                        className="flex-1 py-2 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-lg text-xs font-semibold text-center transition-all flex items-center justify-center gap-1"
                      >
                        <span>Join</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => shareOnWhatsApp(i.meetingLink)}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-all border border-emerald-200"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => copyLink(i.meetingLink, i.interviewId)}
                        className="p-2 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#191c1e] rounded-lg text-xs font-semibold transition-all border border-[#c8c5d0]"
                        title="Copy Link"
                      >
                        {copiedId === i.interviewId ? "Copied!" : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default InterviewSchedule;
