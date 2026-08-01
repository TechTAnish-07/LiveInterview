import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useLiveInterviewStomp } from "./useLiveInterviewStomp";
import VideoCall from "./VideoCall";
import { useAuth } from "../AuthProvider";
import Compiler from "./Compiler";
import api from "../Axios";
import { useWebRTC } from "./useWebRTC";
import { PhoneOff, Clock, ShieldAlert, FileText, Code2, Users, CheckCircle2, Award, AlertTriangle, Terminal } from "lucide-react";

const LiveInterview = () => {
  const { id } = useParams();
  const { isHR, user } = useAuth();
  const token = localStorage.getItem("accessToken");
  const location = useLocation();
  const userId = user?.email || user?.username;

  const mic = location.state?.mic ?? true;
  const camera = location.state?.camera ?? true;
  const interview = location.state?.interview;
  const interviewId = interview?.interviewId || id;
  
  const [sessionTime, setSessionTime] = useState(0);
  const [activeTab, setActiveTab] = useState("problem"); // 'problem', 'notes', 'security'
  const [notes, setNotes] = useState("");
  const [isInterviewActive, setIsInterviewActive] = useState(true);
  const hasCleanedUp = useRef(false);
  const navigate = useNavigate();
  const role = user?.role;

  const {
    connected,
    question,
    updateQuestion,
    code,
    updateCode,
    stompClient,
    output,
    setOutput,
    interviewEnded,
    securityFlags,
    sendSecurityFlag,
    onlineUsers,
    startTime,
    endTime,
    interviewStatus,
    language,
    updateLanguage,
  } = useLiveInterviewStomp({
    interviewId,
    token,
    role,
    userId,
  });

  const { cleanup } = useWebRTC({
    stompClient,
    interviewId,
    userId,
    isHost: isHR,
  });

  useEffect(() => {
    const handleUnload = () => {
      if (!hasCleanedUp.current && isInterviewActive) {
        cleanup();
        hasCleanedUp.current = true;
      }
    };

    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("unload", handleUnload);
      if (!hasCleanedUp.current) {
        cleanup();
        hasCleanedUp.current = true;
      }
    };
  }, [cleanup, isInterviewActive]);

  // Synchronized Timer based on Backend startTime
  useEffect(() => {
    const updateTimer = () => {
      if (startTime) {
        const startMs = new Date(startTime).getTime();
        const nowMs = Date.now();
        const elapsed = Math.max(0, Math.floor((nowMs - startMs) / 1000));
        setSessionTime(elapsed);
      } else {
        setSessionTime((prev) => prev + 1);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Proctoring Security Event Listeners (Triggers for Candidate)
  useEffect(() => {
    if (isHR || !connected) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendSecurityFlag("TAB_SWITCH", "Candidate switched tab or minimized window", {
          hidden: true,
        });
      }
    };

    const handleBlur = () => {
      sendSecurityFlag("FOCUS_LOST", "Candidate window lost focus", {
        blurred: true,
      });
    };

    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        sendSecurityFlag("FULLSCREEN_EXIT", "Candidate exited fullscreen mode", {
          fullscreen: false,
        });
      }
    };

    const handleCopyPaste = (e) => {
      sendSecurityFlag(e.type.toUpperCase(), `Candidate triggered ${e.type} action`, {
        action: e.type,
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreen);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
    };
  }, [isHR, connected, sendSecurityFlag]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleEndInterview = async () => {
    if (isHR) {
      try {
        await api.put(`/api/hr/interview/${interviewId}/end`);
      } catch (err) {
        console.error("Error ending interview:", err);
      }
      navigate(`/feedback/${interviewId}`);
    } else {
      navigate("/dashboard/candidate");
    }
  };

  useEffect(() => {
    if (interviewEnded && !isHR) {
      navigate("/dashboard/candidate");
    }
  }, [interviewEnded, isHR, navigate]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070235] text-white font-sans overflow-hidden">
      
      {/* Top Session Header */}
      <header className="h-14 bg-[#070235] border-b border-[#1e1b4b] px-6 flex items-center justify-between shrink-0">
        
        {/* Brand & Session Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2170e4] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-lg">terminal</span>
            </div>
            <span className="font-bold text-base tracking-tight">LiveInterview</span>
          </div>

          <div className="h-4 w-px bg-[#444173]"></div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase bg-[#002723] text-[#89f5e7] px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a998d] animate-ping"></span>
              Live Room
            </span>
            <span className="text-xs text-[#8683ba] font-mono hidden sm:inline">
              Session ID #{interviewId}
            </span>
          </div>
        </div>

        {/* Timer & Exit Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-[#1e1b4b] px-3 py-1 rounded-lg border border-[#444173]">
            <Clock className="w-3.5 h-3.5 text-[#0058be]" />
            <span>{formatTime(sessionTime)}</span>
          </div>

          <button
            onClick={handleEndInterview}
            className="px-4 py-1.5 bg-[#ba1a1a] hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>{isHR ? "End & Submit Evaluation" : "Leave Session"}</span>
          </button>
        </div>

      </header>

      {/* Main Double Pane Grid */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Master Pane: Video Call & Interactive Tabs */}
        <aside className="w-80 lg:w-96 bg-[#1e1b4b] border-r border-[#444173] flex flex-col shrink-0 overflow-hidden">
          
          {/* Video Feeds Top Half */}
          <div className="h-64 border-b border-[#444173] p-3">
            <VideoCall
              stompClient={stompClient}
              interviewId={interviewId}
              userId={userId}
              mic={mic}
              camera={camera}
              isHost={isHR}
            />
          </div>

          {/* Tab Selection Navigation */}
          <div className="flex border-b border-[#444173] bg-[#070235]">
            <button
              onClick={() => setActiveTab("problem")}
              className={`flex-1 py-2.5 text-xs font-semibold font-mono border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "problem"
                  ? "border-[#2170e4] text-white bg-[#1e1b4b]"
                  : "border-transparent text-[#8683ba] hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Problem
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-2.5 text-xs font-semibold font-mono border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "notes"
                  ? "border-[#2170e4] text-white bg-[#1e1b4b]"
                  : "border-transparent text-[#8683ba] hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Notes
            </button>

            {isHR && (
              <button
                onClick={() => setActiveTab("security")}
                className={`flex-1 py-2.5 text-xs font-semibold font-mono border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                  activeTab === "security"
                    ? "border-[#2170e4] text-white bg-[#1e1b4b]"
                    : "border-transparent text-[#8683ba] hover:text-white"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Security
                {securityFlags.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold animate-pulse">
                    {securityFlags.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 p-4 overflow-y-auto text-xs space-y-4">
            
            {activeTab === "problem" && (
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase bg-[#d8e2ff] text-[#004395] px-2 py-0.5 rounded">
                    Technical Assessment
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white">
                    {question?.title || "Live Coding Problem Statement"}
                  </h3>
                  <p className="text-slate-300 leading-relaxed bg-[#070235] p-3 rounded-lg border border-[#444173]">
                    {question?.content || question?.description || "Implement an algorithm according to interviewer instructions."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="h-full flex flex-col space-y-2 text-left">
                <span className="text-[11px] font-mono text-[#8683ba]">Interviewer Notes & Scratchpad</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record evaluation notes, complexity comments, and observations..."
                  className="flex-1 w-full bg-[#070235] border border-[#444173] rounded-lg p-3 text-slate-200 focus:outline-none focus:border-[#2170e4] resize-none font-mono text-xs"
                />
              </div>
            )}

            {activeTab === "security" && isHR && (
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between border-b border-[#444173] pb-2">
                  <span className="font-mono text-amber-400 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Proctoring Security Logs
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{securityFlags.length} Flagged Events</span>
                </div>

                {securityFlags.length === 0 ? (
                  <div className="p-4 bg-[#070235] rounded-lg border border-[#444173] text-center space-y-1">
                    <span className="text-emerald-400 font-bold font-mono text-xs">Environment Secure</span>
                    <p className="text-slate-400 text-[11px]">No tab switches or focus loss events detected.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {securityFlags.map((flag, idx) => (
                      <div key={idx} className="p-2.5 bg-red-950/40 border border-red-800/40 rounded-lg text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-red-300 font-bold font-mono">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {flag.type}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {flag.timestamp ? new Date(flag.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-200 text-[10px]">{flag.message}</p>
                        {flag.userId && (
                          <div className="text-[9px] text-[#8683ba] font-mono">User: {flag.userId}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </aside>

        {/* Right Detail Pane: Monaco Compiler Editor */}
        <section className="flex-1 h-full overflow-hidden bg-[#0f172a]">
          <Compiler
            value={code}
            onChange={(newCode) => updateCode(newCode)}
            language={language}
            onLanguageChange={(newLang) => updateLanguage(newLang)}
            output={output}
            clearOutput={() => setOutput("")}
          />
        </section>

      </main>

    </div>
  );
};

export default LiveInterview;