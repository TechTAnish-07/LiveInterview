import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Axios";
import { FileText, Upload, Bot, Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react";

export default function AiInterviewEntry() {
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [fetchingResume, setFetchingResume] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [startingSession, setStartingSession] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [jobRole, setJobRole] = useState("Software Engineer");
  const [error, setError] = useState(null);

  // Fetch candidate's latest resume status on mount
  const fetchResume = async () => {
    try {
      setFetchingResume(true);
      setError(null);
      const res = await api.get("/api/resume/me");
      if (res.status === 200 && res.data && res.data.fileUrl) {
        setResume(res.data);
      } else {
        setResume(null);
      }
    } catch (err) {
      if (err.response && (err.response.status === 404 || err.response.status === 204)) {
        setResume(null);
      } else {
        console.error("Error fetching resume:", err);
      }
    } finally {
      setFetchingResume(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files are allowed.");
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds the 5MB limit.");
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a PDF resume file to upload.");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      await api.post("/api/resume/upload", formData);

      setSelectedFile(null);
      setShowUploadForm(false);

      // Refresh resume status
      await fetchResume();
    } catch (err) {
      console.error("Upload error:", err);
      const msg = err.response?.data?.message || "Failed to upload and normalize resume. Please try again.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleStartInterview = async () => {
    try {
      setStartingSession(true);
      setError(null);

      const res = await api.post("/api/ai-interview/start", { jobRole });
      const { sessionId, roomName, token, livekitUrl } = res.data;

      navigate("/ai-interview/room", {
        state: { sessionId, roomName, token, livekitUrl, jobRole },
      });
    } catch (err) {
      console.error("Error starting AI interview:", err);
      const msg = err.response?.data?.message || "Could not initialize AI interview room. Please try again.";
      setError(msg);
    } finally {
      setStartingSession(false);
    }
  };

  const getCleanFilename = (url) => {
    if (!url) return "Uploaded_Resume.pdf";
    const filename = url.split(/[/\\]/).pop();
    return filename.replace(/^\d+_[a-f0-9-]+_/, "");
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans pb-16">
      
      {/* Header */}
      <div className="bg-white border-b border-[#e0e3e5] px-6 md:px-12 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0058be] bg-[#d8e2ff] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                <span>AI Mock Evaluator</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#070235] tracking-tight">
              1:1 Voice AI Mock Interview
            </h1>
            <p className="text-xs text-[#47464f] mt-1">
              Practice real-time technical voice interviews tailored to your verified resume and target position.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-8 space-y-8">

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
        {fetchingResume ? (
          <div className="bg-white rounded-2xl border border-[#e0e3e5] p-12 text-center shadow-xs">
            <Loader2 className="w-8 h-8 text-[#0058be] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#070235]">Checking resume status...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Left Col: Setup & Requirements */}
            <div className="md:col-span-2 space-y-6">

              {/* Resume Status Card */}
              <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[#070235] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#0058be]" />
                    <span>Candidate Resume Verification</span>
                  </h2>
                  {resume && (
                    <span className="text-xs font-mono font-bold bg-[#89f5e7]/40 text-[#005049] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resume On File</span>
                    </span>
                  )}
                </div>

                {resume && !showUploadForm ? (
                  <div className="bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#d8e2ff] text-[#0058be] flex items-center justify-center font-bold">
                          PDF
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#070235] truncate max-w-xs md:max-w-sm">
                            {getCleanFilename(resume.fileUrl)}
                          </p>
                          <p className="text-xs text-[#787680] font-mono mt-0.5">
                            Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowUploadForm(true)}
                        className="text-xs text-[#0058be] hover:underline font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Update Resume</span>
                      </button>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-[#e0e3e5] text-xs text-[#47464f]">
                      <span className="font-semibold text-[#070235]">Extracted Profile Ready: </span>
                      The AI Interviewer will reference your uploaded resume experience and technical skills during the call.
                    </div>
                  </div>
                ) : (
                  /* Upload Form UI */
                  <form onSubmit={handleUpload} className="bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl p-5 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#070235] mb-1">
                        Upload your resume to begin (.PDF only)
                      </label>
                      <p className="text-xs text-[#787680] mb-3">
                        Our system will extract and normalize your experience so the AI voice agent can customize technical questions.
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="w-full text-xs text-[#47464f] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#070235] file:text-white hover:file:bg-[#1e1b4b] cursor-pointer"
                      />
                    </div>

                    {uploading && (
                      <div className="p-3 bg-[#d8e2ff] text-[#004395] rounded-xl text-xs font-semibold flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>Processing your resume text (normalizing skills & experience)...</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                      {resume && (
                        <button
                          type="button"
                          onClick={() => setShowUploadForm(false)}
                          disabled={uploading}
                          className="px-4 py-2 bg-white border border-[#c8c5d0] text-[#191c1e] rounded-xl text-xs font-semibold hover:bg-[#f2f4f6] cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={!selectedFile || uploading}
                        className="px-5 py-2.5 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload & Parse Resume</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Target Role Selector */}
              <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 shadow-xs space-y-3">
                <h2 className="text-base font-bold text-[#070235] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#1a998d]" />
                  <span>Target Interview Position</span>
                </h2>
                <p className="text-xs text-[#787680]">
                  Select the job role for this AI technical evaluation:
                </p>
                <select
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl p-3 text-xs font-semibold text-[#070235] focus:outline-none focus:border-[#0058be]"
                >
                  <option value="Software Engineer">Full Stack Software Engineer</option>
                  <option value="Frontend Engineer">Frontend Engineer (React / Web)</option>
                  <option value="Backend Engineer">Backend Engineer (Java / Distributed Systems)</option>
                  <option value="DevOps Engineer">DevOps & Cloud Engineer</option>
                  <option value="Data Engineer">Data & ML Engineer</option>
                </select>
              </div>

            </div>

            {/* Right Col: Launch Action Card */}
            <div className="space-y-6">
              <div className="bg-gradient-to-b from-[#070235] to-[#1e1b4b] text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/10 text-[#89f5e7] flex items-center justify-center mb-4">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Live AI Technical Interview</h3>
                  <p className="text-xs text-[#8683ba] leading-relaxed mb-6">
                    Connect via high-quality WebRTC voice transport directly with the LiveKit AI agent. Experience real-time adaptive Q&A, follow-ups, and audio interaction.
                  </p>

                  <div className="space-y-2 text-xs text-[#d8e2ff] font-mono bg-white/5 p-3 rounded-xl border border-white/10 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#89f5e7]"></span>
                      <span>Audio Input: Microphone required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#89f5e7]"></span>
                      <span>Duration: 10 - 20 Minutes</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartInterview}
                  disabled={!resume || startingSession}
                  className="w-full py-3.5 bg-[#89f5e7] hover:bg-[#5cecd9] text-[#003732] font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {startingSession ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Minting LiveKit Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Start AI Mock Interview</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {!resume && (
                  <p className="text-[11px] text-[#ffdad6] text-center mt-2 font-mono">
                    Please upload your resume to enable the interview call.
                  </p>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
