import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import api from "../Axios";
import { Code, Terminal, Minus, Plus, FileText, CheckCircle2, RefreshCw, Sparkles, Play, AlertTriangle, Trash2 } from "lucide-react";

const LANGUAGES = [
  { id: "python", label: "Python 3" },
  { id: "javascript", label: "JavaScript (Node)" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "typescript", label: "TypeScript" },
  { id: "go", label: "Go" },
];

export default function AiCodingPanel({
  sessionId,
  questionText = "",
  code = "",
  onChange,
  language = "python",
  onLanguageChange,
  isSyncing = false,
  onRunResult,
}) {
  const [fontSize, setFontSize] = useState(13);
  const [stdin, setStdin] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [running, setRunning] = useState(false);
  const [outputResult, setOutputResult] = useState(null);

  const handleRunCode = async () => {
    if (!sessionId) {
      console.warn("Session ID is missing, cannot execute code.");
      return;
    }

    try {
      setRunning(true);
      setOutputResult({ status: "Running...", stdout: "", stderr: "" });

      const res = await api.post(`/api/ai-interview/${sessionId}/run-code`, {
        code,
        language,
        stdin: stdin.trim() ? stdin : undefined,
      });

      const data = res.data || {};
      setOutputResult(data);

      // Publish run result to LiveKit room for the AI agent
      if (onRunResult) {
        onRunResult({
          code,
          stdout: data.stdout || "",
          stderr: data.stderr || data.compileOutput || "",
          status: data.status || "Completed",
        });
      }
    } catch (err) {
      console.error("Error executing code via /run-code:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to execute code";
      const errObj = {
        status: "Execution Error",
        stdout: "",
        stderr: errMsg,
      };
      setOutputResult(errObj);

      if (onRunResult) {
        onRunResult({
          code,
          stdout: "",
          stderr: errMsg,
          status: "Execution Error",
        });
      }
    } finally {
      setRunning(false);
    }
  };

  const clearOutput = () => {
    setOutputResult(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-200 font-sans border-l border-[#444173]/50 overflow-hidden">
      
      {/* Question Panel (Header / Top Section) */}
      <div className="bg-[#131139] border-b border-[#444173] p-3 md:p-4 flex flex-col gap-2 shrink-0 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#2170e4]/20 border border-[#2170e4]/40 flex items-center justify-center text-[#89f5e7]">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">
              {questionText ? "Coding Challenge" : "Interactive Code Scratchpad"}
            </span>
          </div>
          {questionText ? (
            <span className="px-2.5 py-0.5 bg-[#89f5e7]/10 text-[#89f5e7] border border-[#89f5e7]/30 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Assigned by AI Agent</span>
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              Live synced with AI interviewer
            </span>
          )}
        </div>

        {questionText ? (
          <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap bg-[#0b0826]/80 p-3 rounded-lg border border-[#444173]/60 max-h-36 overflow-y-auto">
            {questionText}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 font-sans italic bg-[#0b0826]/40 px-3 py-1.5 rounded border border-[#444173]/40">
            Write, test, and run code anytime. When the AI interviewer assigns a challenge, it will appear here automatically.
          </div>
        )}
      </div>

      {/* Editor Toolbar */}
      <div className="min-h-11 py-1.5 bg-[#1e1b4b] border-b border-[#444173] px-3 md:px-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono shrink-0">
        
        {/* Language Selection & Sync */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-[#8683ba]">
            <Code className="w-4 h-4 text-[#89f5e7]" />
            <span className="font-semibold text-white hidden sm:inline">Editor</span>
          </div>

          <select
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className="bg-[#070235] text-white border border-[#444173] text-xs py-1 px-2.5 rounded-lg focus:outline-none focus:border-[#2170e4] cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>

          {/* Stdin Toggle */}
          <button
            onClick={() => setShowStdin(!showStdin)}
            className={`px-2 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
              showStdin || stdin
                ? "bg-[#2170e4]/20 border-[#2170e4] text-[#89f5e7]"
                : "bg-[#070235] border-[#444173] text-slate-400 hover:text-white"
            }`}
            title="Toggle Custom Input (stdin)"
          >
            stdin {stdin ? "•" : ""}
          </button>
        </div>

        {/* Action Controls & Run Button */}
        <div className="flex items-center gap-2">
          {/* Agent Sync Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 bg-[#070235] rounded-lg border border-[#444173] text-[10px] font-mono">
            {isSyncing ? (
              <>
                <RefreshCw className="w-2.5 h-2.5 text-amber-400 animate-spin" />
                <span className="text-amber-300">Syncing...</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-300">Live</span>
              </>
            )}
          </div>

          {/* Font Size Adjusters */}
          <div className="flex items-center gap-1 bg-[#070235] p-0.5 rounded-lg border border-[#444173] text-[11px]">
            <button
              onClick={() => setFontSize((s) => Math.max(10, s - 1))}
              className="px-1.5 py-0.5 hover:bg-white/10 rounded text-slate-300 transition-colors"
              title="Decrease Font Size"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-1 text-slate-400 font-mono text-[10px]">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(20, s + 1))}
              className="px-1.5 py-0.5 hover:bg-white/10 rounded text-slate-300 transition-colors"
              title="Increase Font Size"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={running}
            className="px-3.5 py-1.5 bg-[#2170e4] hover:bg-[#0058be] text-white font-semibold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {running ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 min-h-[220px] relative overflow-hidden bg-[#0f172a]">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : language}
          value={code}
          theme="vs-dark"
          onChange={onChange}
          options={{
            fontSize,
            fontFamily: "JetBrains Mono, monospace",
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            lineNumbers: "on",
            tabSize: 4,
            cursorBlinking: "smooth",
            formatOnPaste: true,
            padding: { top: 10 },
          }}
        />
      </div>

      {/* Optional Stdin Input Drawer */}
      {showStdin && (
        <div className="h-20 bg-[#0a0f1d] border-t border-[#444173]/70 p-2 flex flex-col font-mono text-xs shrink-0">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold mb-1">
            <span>Standard Input (stdin)</span>
            <button
              onClick={() => setStdin("")}
              className="hover:text-red-400 text-slate-500"
            >
              Clear
            </button>
          </div>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Enter custom stdin arguments here..."
            className="flex-1 bg-[#151d30] text-slate-200 border border-slate-700/60 rounded p-1.5 text-xs focus:outline-none focus:border-[#2170e4] resize-none"
          />
        </div>
      )}

      {/* Execution Output Console */}
      <div className="h-36 max-h-[35%] bg-[#070a14] border-t border-[#444173] p-3 font-mono text-xs overflow-y-auto shrink-0 flex flex-col">
        <div className="flex items-center justify-between text-slate-400 mb-1.5 pb-1 border-b border-slate-800 text-[11px] font-bold">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#2170e4]" />
            <span>Execution Console</span>
          </div>

          {outputResult && (
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                  outputResult.status?.toLowerCase().includes("accepted") || outputResult.status?.toLowerCase().includes("completed")
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : outputResult.status === "Running..."
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                {outputResult.status}
              </span>
              <button
                onClick={clearOutput}
                className="text-slate-500 hover:text-slate-300 p-0.5"
                title="Clear console"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto font-mono text-xs">
          {!outputResult ? (
            <span className="text-slate-500 italic text-[11px]">
              Click "Run Code" to compile and execute your solution...
            </span>
          ) : outputResult.status === "Running..." ? (
            <div className="flex items-center gap-2 text-amber-400 text-[11px] py-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Executing code via Judge0...</span>
            </div>
          ) : (
            <div className="space-y-1">
              {outputResult.compileOutput && (
                <div className="text-amber-400 whitespace-pre-wrap pb-1 border-b border-slate-800/80">
                  <span className="text-[10px] text-amber-500 uppercase font-bold block">Compiler Output:</span>
                  {outputResult.compileOutput}
                </div>
              )}
              {outputResult.stderr && (
                <div className="text-red-400 whitespace-pre-wrap">
                  <span className="text-[10px] text-red-500 uppercase font-bold block">Standard Error:</span>
                  {outputResult.stderr}
                </div>
              )}
              {outputResult.stdout && (
                <pre className="text-emerald-400 whitespace-pre-wrap">{outputResult.stdout}</pre>
              )}
              {!outputResult.stdout && !outputResult.stderr && !outputResult.compileOutput && (
                <span className="text-slate-400 italic text-[11px]">
                  (Process completed with no output)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
