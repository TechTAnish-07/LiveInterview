import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Axios";
import { FileText, Upload, Bot, Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw, Key, Lock, Eye, EyeOff, Shield, ExternalLink } from "lucide-react";

export default function AiInterviewEntry() {
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [fetchingResume, setFetchingResume] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [startingSession, setStartingSession] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [jobTitle, setJobTitle] = useState("Software Engineer");
  const [relevanceWarning, setRelevanceWarning] = useState(null);
  const [error, setError] = useState(null);

  // Bring Your Own Key (BYOK) State
  const [llmProvider, setLlmProvider] = useState("gemini");
  const [llmApiKey, setLlmApiKey] = useState(() => sessionStorage.getItem("candidate_llm_key") || "");
  const [showKey, setShowKey] = useState(false);
  const [keyTouched, setKeyTouched] = useState(false);

  // Validate API key based on chosen provider
  const validateApiKey = (key, provider) => {
    if (!key || !key.trim()) return { valid: false, message: "API key is required to start the interview session." };
    const trimmed = key.trim();
    if (trimmed.length < 20) {
      return { valid: false, message: "API key must be at least 20 characters long." };
    }
    if (provider === "openai" && !trimmed.startsWith("sk-")) {
      return { valid: false, message: "OpenAI API keys typically begin with 'sk-'." };
    }
    if (provider === "gemini" && !trimmed.startsWith("AIza")) {
      return { valid: false, message: "Google Gemini API keys typically begin with 'AIza'." };
    }
    if (provider === "groq" && !trimmed.startsWith("gsk_")) {
      return { valid: false, message: "Groq API keys typically begin with 'gsk_'." };
    }
    return { valid: true, message: "Key format validated" };
  };

  const keyValidation = validateApiKey(llmApiKey, llmProvider);

  // Update sessionStorage on key change
  const handleKeyChange = (e) => {
    const val = e.target.value;
    setLlmApiKey(val);
    setKeyTouched(true);
    if (val.trim()) {
      sessionStorage.setItem("candidate_llm_key", val.trim());
    } else {
      sessionStorage.removeItem("candidate_llm_key");
    }
  };

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

  // Clear the ephemeral key from sessionStorage on unmount (tab close, navigation away)
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("candidate_llm_key");
    };
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
      setRelevanceWarning(null);

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

  const startSessionDirectly = async (titleToUse) => {
    if (!keyValidation.valid) {
      setKeyTouched(true);
      setError(keyValidation.message);
      return;
    }

    try {
      setStartingSession(true);
      setError(null);

      const title = titleToUse || jobTitle || "Software Engineer";
      const headers = llmApiKey.trim() ? { "X-Candidate-Llm-Key": llmApiKey.trim() } : {};

      const res = await api.post("/api/ai-interview/start", { jobTitle: title, jobRole: title }, { headers });
      const { sessionId, roomName, token, livekitUrl } = res.data;

      navigate("/ai-interview/room", {
        state: { sessionId, roomName, token, livekitUrl, jobTitle: title, jobRole: title },
      });
    } catch (err) {
      console.error("Error starting AI interview:", err);
      const msg = err.response?.data?.message || "Could not initialize AI interview room. Please check your API key.";
      setError(msg);
    } finally {
      setStartingSession(false);
    }
  };

  const handleStartInterview = async () => {
    if (!keyValidation.valid) {
      setKeyTouched(true);
      setError(keyValidation.message);
      return;
    }

    try {
      setCheckingEligibility(true);
      setError(null);
      setRelevanceWarning(null);

      const title = jobTitle || "Software Engineer";
      const headers = llmApiKey.trim() ? { "X-Candidate-Llm-Key": llmApiKey.trim() } : {};

      const checkRes = await api.post("/api/ai-interview/check-eligibility", { jobTitle: title }, { headers });

      if (checkRes.data && checkRes.data.relevant === false) {
        setRelevanceWarning({
          reason: checkRes.data.reason || "Your resume may not closely match this target job role."
        });
        setCheckingEligibility(false);
        return;
      }

      // If relevant is true, proceed directly to start
      setCheckingEligibility(false);
      await startSessionDirectly(title);
    } catch (err) {
      console.error("Error checking eligibility:", err);
      setCheckingEligibility(false);
      await startSessionDirectly(jobTitle);
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

        {/* Relevance Warning Banner */}
        {relevanceWarning && (
          <div className="bg-[#fff8f0] border border-[#f5d0a9] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#ffe8d1] text-[#9c4b00] flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9c4b00] mb-1">
                  Resume Relevance Guidance
                </h4>
                <p className="text-xs text-[#5c3100] leading-relaxed">
                  {relevanceWarning.reason}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f5d0a9]/60">
              <button
                onClick={() => setRelevanceWarning(null)}
                disabled={startingSession}
                className="px-3.5 py-1.5 bg-white border border-[#d6b088] text-[#5c3100] hover:bg-[#fff0e0] rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Change job title
              </button>

              <button
                onClick={() => startSessionDirectly(jobTitle)}
                disabled={startingSession}
                className="px-4 py-1.5 bg-[#9c4b00] hover:bg-[#803d00] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                {startingSession ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed anyway</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
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

                    <div className="p-4 bg-white rounded-lg border border-[#e0e3e5] text-xs text-[#47464f] space-y-3">
                      {resume.summary && (
                        <div>
                          <span className="font-bold text-[#070235]">Extracted Summary: </span>
                          <span className="text-[#47464f]">{resume.summary}</span>
                        </div>
                      )}

                      {resume.skills && resume.skills.length > 0 && (
                        <div>
                          <span className="font-bold text-[#070235] block mb-1.5">Verified Technical Skills:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {resume.skills.map((skill) => (
                              <span key={skill} className="px-2 py-0.5 bg-[#d8e2ff]/60 text-[#004395] text-[11px] font-mono font-semibold rounded-md">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(!resume.summary && (!resume.skills || resume.skills.length === 0)) && (
                        <div>
                          <span className="font-semibold text-[#070235]">Extracted Profile Ready: </span>
                          The AI Interviewer will reference your uploaded resume experience and technical skills during the call.
                        </div>
                      )}
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
                        <span>Processing & analyzing your resume (extracting skills & suitable target roles)...</span>
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
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload & Analyze Resume</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Target Job Title Input (Shown once resume is on file or uploaded) */}
              {resume && (
                <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#070235] flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#1a998d]" />
                      <span>Target Job Title</span>
                    </h2>
                    <span className="text-[11px] text-[#787680] font-mono">Pre-flight Checked</span>
                  </div>
                  <p className="text-xs text-[#787680]">
                    Enter or select the position you are interviewing for:
                  </p>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => {
                        setJobTitle(e.target.value);
                        if (relevanceWarning) setRelevanceWarning(null);
                      }}
                      placeholder="e.g. Software Engineer, Full Stack Developer, Backend Engineer"
                      className="w-full bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl p-3 text-xs font-semibold text-[#070235] focus:outline-none focus:border-[#0058be] transition-colors"
                    />

                    {/* Preset role suggestions */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-[#787680] font-medium block">
                        {resume.suitableRoles && resume.suitableRoles.length > 0 ? "Recommended Target Roles based on your Resume:" : "Suggested Target Roles:"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(resume.suitableRoles && resume.suitableRoles.length > 0
                          ? resume.suitableRoles
                          : ["Software Engineer", "Frontend Engineer", "Backend Engineer", "DevOps Engineer", "Data Engineer"]
                        ).map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              setJobTitle(role);
                              if (relevanceWarning) setRelevanceWarning(null);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                              jobTitle === role
                                ? "bg-[#0058be] text-white font-semibold"
                                : "bg-[#f2f4f6] text-[#47464f] hover:bg-[#e0e3e5]"
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Col: BYOK Key + Launch Card */}
            <div className="space-y-5">

              {/* BYOK API Key Card */}
              <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#070235] flex items-center gap-2">
                    <Key className="w-5 h-5 text-[#0058be]" />
                    <span>Your LLM API Key</span>
                  </h2>
                  <span className="px-2 py-0.5 bg-[#fff3cd] text-[#7c5e00] text-[10px] font-mono font-bold rounded-full uppercase tracking-wide border border-[#f0d980]">
                    Required
                  </span>
                </div>

                {/* Provider selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#47464f] uppercase tracking-wide">
                    LLM Provider
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "gemini", label: "Gemini", hint: "AIza..." },
                      { id: "openai", label: "OpenAI", hint: "sk-..." },
                      { id: "groq",   label: "Groq",   hint: "gsk_..." },
                    ].map(({ id, label, hint }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => { setLlmProvider(id); setKeyTouched(false); }}
                        className={`py-2 px-3 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                          llmProvider === id
                            ? "border-[#0058be] bg-[#d8e2ff] text-[#0058be]"
                            : "border-[#e0e3e5] bg-[#f7f9fb] text-[#47464f] hover:border-[#c8c5d0]"
                        }`}
                      >
                        <span className="block">{label}</span>
                        <span className="block text-[9px] font-mono opacity-70 mt-0.5">{hint}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#47464f] uppercase tracking-wide">
                      API Key
                    </label>
                    {keyTouched && (
                      <span className={`text-[10px] font-mono font-semibold flex items-center gap-1 ${keyValidation.valid ? "text-[#1a8754]" : "text-[#ba1a1a]"}`}>
                        {keyValidation.valid
                          ? <><CheckCircle2 className="w-3 h-3" /> Valid format</>
                          : <><AlertCircle className="w-3 h-3" /> {keyValidation.message}</>
                        }
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#787680] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showKey ? "text" : "password"}
                      value={llmApiKey}
                      onChange={handleKeyChange}
                      placeholder={
                        llmProvider === "gemini" ? "AIzaSy..." :
                        llmProvider === "openai" ? "sk-proj-..." :
                        "gsk_..."
                      }
                      autoComplete="off"
                      spellCheck={false}
                      className={`w-full pl-9 pr-10 py-2.5 text-xs font-mono rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                        keyTouched && !keyValidation.valid
                          ? "border-[#ba1a1a] bg-[#fff8f8] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/20"
                          : keyTouched && keyValidation.valid
                          ? "border-[#1a8754] bg-[#f0faf4] focus:border-[#1a8754] focus:ring-[#1a8754]/20"
                          : "border-[#c8c5d0] bg-[#f7f9fb] focus:border-[#0058be] focus:ring-[#0058be]/20"
                      } text-[#191c1e]`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787680] hover:text-[#070235] cursor-pointer"
                      tabIndex={-1}
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Privacy note */}
                <div className="flex items-start gap-2 px-3 py-2.5 bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl">
                  <Shield className="w-3.5 h-3.5 text-[#1a8754] shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#47464f] leading-relaxed">
                    <span className="font-bold text-[#070235]">Privacy:</span> Your key is used only for this session and is <span className="font-semibold">never stored on our servers</span>. It is transmitted over HTTPS only and cleared when you close the tab.
                  </p>
                </div>

                {/* Provider docs link */}
                <a
                  href={
                    llmProvider === "gemini" ? "https://aistudio.google.com/apikey" :
                    llmProvider === "openai" ? "https://platform.openai.com/api-keys" :
                    "https://console.groq.com/keys"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-[#0058be] hover:underline font-semibold"
                >
                  <ExternalLink className="w-3 h-3" />
                  Get a {llmProvider === "gemini" ? "Gemini" : llmProvider === "openai" ? "OpenAI" : "Groq"} API key (free tier available)
                </a>
              </div>

              {/* Launch Action Card */}
              <div className="bg-gradient-to-b from-[#070235] to-[#1e1b4b] text-white rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/10 text-[#89f5e7] flex items-center justify-center mb-4">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Live AI Technical Interview</h3>
                  <p className="text-xs text-[#8683ba] leading-relaxed mb-4">
                    Connect via WebRTC voice transport with the LiveKit AI agent. Real-time adaptive Q&amp;A, follow-ups, and audio interaction — powered by your own API key.
                  </p>

                  <div className="space-y-2 text-xs text-[#d8e2ff] font-mono bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#89f5e7]"></span>
                      <span>Audio Input: Microphone required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#89f5e7]"></span>
                      <span>Target Role: {jobTitle || "Software Engineer"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${keyValidation.valid ? "bg-[#89f5e7]" : "bg-[#ffdad6]"}`}></span>
                      <span className={keyValidation.valid ? "" : "text-[#ffdad6]"}>
                        LLM Key: {keyValidation.valid ? "Ready" : "Required"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartInterview}
                  disabled={!resume || startingSession || checkingEligibility || !keyValidation.valid}
                  className="w-full py-3.5 bg-[#89f5e7] hover:bg-[#5cecd9] text-[#003732] font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {checkingEligibility ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying resume eligibility...</span>
                    </>
                  ) : startingSession ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initialising LiveKit session...</span>
                    </>
                  ) : (
                    <>
                      <span>Start AI Mock Interview</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {!resume && (
                  <p className="text-[11px] text-[#ffdad6] text-center font-mono -mt-2">
                    Upload your resume above to enable the call.
                  </p>
                )}
                {!keyValidation.valid && resume && (
                  <p className="text-[11px] text-[#ffdad6] text-center font-mono -mt-2">
                    Enter a valid API key above to start.
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


