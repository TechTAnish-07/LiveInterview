import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { ArrowRight, Video, Code, ShieldCheck, Calendar, Sparkles, CheckCircle2, User, Play, Award, Terminal } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const isLoggedIn = !!user;

  const handleGetStarted = (targetRole) => {
    if (isLoggedIn) {
      if (role === "HR") navigate("/dashboard/hr");
      else navigate("/dashboard/candidate");
    } else {
      navigate("/login", { state: { initialRole: targetRole || "HR" } });
    }
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen font-sans selection:bg-[#d8e2ff]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 px-6 md:px-12 bg-radial from-[#f7f9fb] via-[#eceef0] to-[#f7f9fb]">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#2170e4]/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-[#1a998d]/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#e3dfff] text-[#181445] rounded-full mb-8 shadow-xs border border-[#c4c1fb]/50 animate-pulse">
            <Sparkles className="w-4 h-4 text-[#0058be]" />
            <span className="text-xs font-semibold font-mono tracking-wide uppercase">Next-Gen Evaluation Suite</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#070235] max-w-4xl tracking-tight leading-[1.15] mb-6">
            Technical Interviews. <br />
            <span className="bg-gradient-to-r from-[#0058be] to-[#2170e4] bg-clip-text text-transparent">
              Zero Friction. High Precision.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#47464f] max-w-2xl mb-10 leading-relaxed">
            The unified workspace for real-time technical evaluations. Integrated video, collaborative Monaco code editor, Judge0 execution, and automated AI candidate reports in one place.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto">
            <button
              onClick={() => handleGetStarted("HR")}
              className="w-full sm:w-auto px-8 py-4 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all group cursor-pointer"
            >
              <span>Login as HR / Recruiter</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleGetStarted("CANDIDATE")}
              className="w-full sm:w-auto px-8 py-4 border border-[#c8c5d0] hover:border-[#0058be] text-[#070235] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-white hover:bg-[#f2f4f6] transition-all shadow-xs cursor-pointer"
            >
              <User className="w-4 h-4 text-[#0058be]" />
              <span>Login as Candidate</span>
            </button>
          </div>

          {/* IDE Interactive Live Workspace Preview */}
          <div className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-[#c8c5d0]/70 bg-white">
            
            {/* Top Editor Bar */}
            <div className="h-11 bg-[#1e1b4b] text-white flex items-center justify-between px-4 font-mono text-xs border-b border-[#444173]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ba1a1a]"></div>
                <div className="w-3 h-3 rounded-full bg-[#2170e4]"></div>
                <div className="w-3 h-3 rounded-full bg-[#1a998d]"></div>
                <span className="ml-2 text-[#8683ba] font-medium flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#6bd8cb]" />
                  live_interview_session.py
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-[#89f5e7] bg-[#002723] px-2.5 py-1 rounded-md text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#1a998d] animate-ping"></span>
                  Live Code Sync
                </span>
              </div>
            </div>

            {/* IDE Workspace Body */}
            <div className="flex flex-col md:flex-row min-h-auto md:min-h-[480px] text-left">
              
              {/* Left Sidebar: Audio/Video & Notes */}
              <div className="w-full md:w-80 bg-[#f7f9fb] border-b md:border-b-0 md:border-r border-[#c8c5d0]/50 p-4 flex flex-col justify-between gap-4 shrink-0">
                
                <div className="space-y-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#47464f] block mb-1">
                    Live Video Participants
                  </span>
                  
                  {/* Interviewer & Candidate Tiles Grid on Mobile / Stacked on Desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
                    {/* Interviewer Tile */}
                    <div className="relative rounded-xl overflow-hidden aspect-video min-h-[110px] bg-gradient-to-br from-[#1e1b4b] to-[#070235] shadow-md border border-[#c8c5d0]/40 flex flex-col items-center justify-center p-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#8683ba]/20 text-[#89f5e7] flex items-center justify-center font-bold font-mono border border-[#444173] text-sm md:text-lg shadow-inner">
                        SJ
                      </div>
                      <span className="text-[10px] font-mono text-[#8683ba] mt-1">HD Video Stream</span>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-white text-[10px] md:text-[11px] font-mono">
                        Sarah Jenkins (HR Lead)
                      </div>
                    </div>

                    {/* Candidate Tile */}
                    <div className="relative rounded-xl overflow-hidden aspect-video min-h-[110px] bg-gradient-to-br from-[#070235] to-[#1e1b4b] shadow-md border-2 border-[#0058be] ring-2 ring-[#0058be]/20 flex flex-col items-center justify-center p-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#0058be]/30 text-white flex items-center justify-center font-bold font-mono border border-[#0058be] text-sm md:text-lg shadow-inner animate-pulse">
                        AR
                      </div>
                      <span className="text-[10px] font-mono text-[#8683ba] mt-1">Mic Active • 48kHz</span>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-white text-[10px] md:text-[11px] font-mono">
                        Alex Rivera (Candidate)
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#0058be] text-white rounded text-[9px] md:text-[10px] font-mono font-bold uppercase">
                        Speaking
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Indicator */}
                <div className="bg-white p-3 rounded-xl border border-[#c8c5d0]/50 shadow-xs mt-2">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#070235]">Technical Precision Score</span>
                    <span className="font-mono text-[#0058be] font-bold">94%</span>
                  </div>
                  <div className="w-full bg-[#eceef0] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0058be] h-full w-[94%] transition-all duration-500"></div>
                  </div>
                </div>
              </div>

              {/* Right Main Editor Area */}
              <div className="flex-1 bg-[#0f172a] p-4 md:p-6 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto relative min-h-[260px]">
                <pre>
                  <code>
<span className="text-purple-400">def</span> <span className="text-blue-400 font-bold">two_sum_optimized</span>(nums: list[int], target: int) -&gt; list[int]:
{"    "}<span className="text-slate-500"># Store compliment map for O(n) lookups</span>
{"    "}seen = {}
{"    "}<span className="text-purple-400">for</span> idx, num <span className="text-purple-400">in</span> <span className="text-yellow-300">enumerate</span>(nums):
{"        "}compliment = target - num
{"        "}<span className="text-purple-400">if</span> compliment <span className="text-purple-400">in</span> seen:
{"            "}<span className="text-purple-400">return</span> [seen[compliment], idx]
{"        "}seen[num] = idx
{"    "}<span className="text-purple-400">return</span> []

<span className="text-slate-500"># Live Execution Results:</span>
<span className="text-emerald-400">✓ Test Case 1: Passed (Memory: 14.2MB, Time: 2ms)</span>
<span className="text-emerald-400">✓ Test Case 2: Passed (All inputs verified)</span>
                  </code>
                </pre>

                {/* Floating Typing Cursor */}
                <div className="absolute top-28 right-24 hidden lg:flex items-center gap-1.5 bg-[#2170e4] text-white px-2 py-0.5 rounded shadow-lg text-[10px]">
                  <span>Alex typing...</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Platform Overview: 4 Core Capability Tracks */}
      <section className="py-20 px-6 md:px-12 bg-white border-t border-[#e0e3e5]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d8e2ff] text-[#0058be] rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unified Ecosystem</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#070235] tracking-tight">
                Four Pillars of Technical Excellence
              </h2>
            </div>
            <p className="text-sm text-[#47464f] max-w-md leading-relaxed">
              Experience seamless end-to-end evaluations across live sessions, AI mock interviews, practice banks, and deep analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Track 1: Live HR ↔ Candidate Technical Sessions */}
            <div className="p-7 rounded-3xl bg-[#f7f9fb] border border-[#e0e3e5] hover:border-[#0058be] hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#070235] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Video className="w-7 h-7 text-[#89f5e7]" />
                  </div>
                  <span className="px-3 py-1 bg-[#e3dfff] text-[#181445] rounded-full text-[11px] font-mono font-bold uppercase">
                    Track 01 • Live Studio
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#070235] mb-2.5">
                  Live HR ↔ Candidate Technical Sessions
                </h3>
                <p className="text-xs text-[#47464f] leading-relaxed mb-6">
                  Synchronized Monaco code editor with live WebSocket broadcast, WebRTC HD audio/video calling, real-time Judge0 test execution, and tab proctoring.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-2.5 py-1 bg-white border border-[#c8c5d0] rounded-lg text-[10px] font-mono text-[#191c1e]">
                    HD WebRTC Video
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-[#c8c5d0] rounded-lg text-[10px] font-mono text-[#191c1e]">
                    Monaco Live Sync
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-[#c8c5d0] rounded-lg text-[10px] font-mono text-[#191c1e]">
                    Tab Proctoring
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (role === "HR" || role === "ADMIN") navigate("/schedule/hr");
                  else if (role === "CANDIDATE") navigate("/schedule/candidate");
                  else navigate("/login", { state: { initialRole: "HR" } });
                }}
                className="w-full py-3 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs group/btn cursor-pointer"
              >
                <span>Launch Live Session</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Track 2: AI Voice & Resume Interviewer */}
            <div className="p-7 rounded-3xl bg-[#f7f9fb] border border-[#e0e3e5] hover:border-[#0058be] hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#0058be] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Sparkles className="w-7 h-7 text-[#89f5e7]" />
                  </div>
                  <span className="px-3 py-1 bg-[#d8e2ff] text-[#0058be] rounded-full text-[11px] font-mono font-bold uppercase">
                    Track 02 • AI Simulation
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#070235] mb-2.5">
                  Autonomous AI Mock Interviewer
                </h3>
                <p className="text-xs text-[#47464f] leading-relaxed mb-6">
                  Practice with a real-time voice-enabled AI interviewer. Upload your resume to match targeted roles (Frontend, Backend, SDE, AI Engineer) with dynamic coding problems.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-2.5 py-1 bg-white border border-[#c8c5d0] rounded-lg text-[10px] font-mono text-[#191c1e]">
                    Voice Speech-to-Text
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-[#c8c5d0] rounded-lg text-[10px] font-mono text-[#191c1e]">
                    Resume Normalization
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-[#c8c5d0] rounded-lg text-[10px] font-mono text-[#191c1e]">
                    Instant Feedback
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (role === "CANDIDATE") navigate("/ai-interview");
                  else navigate("/login", { state: { initialRole: "CANDIDATE" } });
                }}
                className="w-full py-3 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs group/btn cursor-pointer"
              >
                <span>Start AI Mock Interview</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Track 3: Practice Question Bank & DSA Tracker */}
            <div className="p-7 rounded-3xl bg-[#f7f9fb] border border-[#e0e3e5] hover:border-[#0058be] hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#181445] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Code className="w-7 h-7 text-[#89f5e7]" />
                  </div>
                  <span className="px-3 py-1 bg-[#e3dfff] text-[#181445] rounded-full text-[11px] font-mono font-bold uppercase">
                    Track 03 • Code Bank
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#070235] mb-2.5">
                  Question Bank & DSA Problem Tracker
                </h3>
                <p className="text-xs text-[#47464f] leading-relaxed mb-6">
                  Master algorithms with our integrated 200+ problem DSA Tracker and author customizable practice questions available for live session attachment.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-2.5 py-1 bg-white border border-[#c8c5d0] rounded-lg text-[10px] font-mono text-[#191c1e]">
                    200+ Curated Problems
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-[#c8c5d0] rounded-lg text-[10px] font-mono text-[#191c1e]">
                    Multi-Language Execution
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-[#c8c5d0] rounded-lg text-[10px] font-mono text-[#191c1e]">
                    Topic Organization
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/dsa-tracker")}
                  className="flex-1 py-3 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <span>Open DSA Tracker</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {role === "ADMIN" && (
                  <button
                    onClick={() => navigate("/admin/questions")}
                    className="px-4 py-3 bg-white border border-[#c8c5d0] text-[#070235] hover:bg-[#eceef0] rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    title="Manage Bank"
                  >
                    Bank Admin
                  </button>
                )}
              </div>
            </div>

            {/* Track 4: Feedback & Evaluation Reports */}
            <div className="p-7 rounded-3xl bg-[#f7f9fb] border border-[#e0e3e5] hover:border-[#0058be] hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#005049] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Award className="w-7 h-7 text-[#89f5e7]" />
                  </div>
                  <span className="px-3 py-1 bg-[#89f5e7]/30 text-[#005049] rounded-full text-[11px] font-mono font-bold uppercase">
                    Track 04 • Intelligence
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#070235] mb-2.5">
                  Granular Evaluations & AI Feedback
                </h3>
                <p className="text-xs text-[#47464f] leading-relaxed mb-6">
                  Comprehensive candidate scorecards analyzing algorithmic correctness, time complexity, communication clarity, and verifiable proctoring integrity logs.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-2.5 py-1 bg-white border border-[#c8c5d0] rounded-lg text-[10px] font-mono text-[#191c1e]">
                    Rubric Scoring
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-[#c8c5d0] rounded-lg text-[10px] font-mono text-[#191c1e]">
                    Code Complexity Stats
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-[#c8c5d0] rounded-lg text-[10px] font-mono text-[#191c1e]">
                    Proctoring Audit
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (role === "HR") navigate("/dashboard/hr");
                  else if (role === "CANDIDATE") navigate("/ai-interview/history");
                  else if (role === "ADMIN") navigate("/admin/dashboard");
                  else navigate("/login", { state: { initialRole: "HR" } });
                }}
                className="w-full py-3 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs group/btn cursor-pointer"
              >
                <span>View Evaluation Metrics</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Call to Action */}
      <section className="py-20 px-6 bg-[#070235] text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 tracking-tight">
            Ready to elevate your engineering interviews?
          </h2>
          <p className="text-sm sm:text-base text-[#8683ba] max-w-xl mx-auto mb-8">
            Join hundreds of recruiters and candidates conducting structured, high-precision technical evaluations.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => handleGetStarted("HR")}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#2170e4] hover:bg-[#0058be] text-white rounded-xl font-semibold text-sm transition-all shadow-md cursor-pointer"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;