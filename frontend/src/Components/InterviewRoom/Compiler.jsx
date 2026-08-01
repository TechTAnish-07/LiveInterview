import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import api from "../Axios";
import { useParams } from "react-router-dom";
import { Play, Code, Terminal, Minus, Plus, RefreshCw } from "lucide-react";

const LANGUAGES = [
  { id: "python", label: "Python 3.8" },
  { id: "javascript", label: "JavaScript (Node)" },
  { id: "java", label: "Java 13" },
  { id: "cpp", label: "C++ 17" },
  { id: "typescript", label: "TypeScript" },
  { id: "go", label: "Go 1.13" },
];

export default function Compiler({ value, onChange, language = "python", onLanguageChange, output, clearOutput }) {
  const [fontSize, setFontSize] = useState(13);
  const interviewId = useParams().id;
  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);

  const handleRunCode = async (codeValue) => {
    try {
      setRunning(true);
      if (clearOutput) clearOutput();
      await api.post("/api/coding/interview/run", {
        interviewId: interviewId,
        sourceCode: codeValue,
        language,
        stdin: stdin,
      });
    } catch (err) {
      console.error("Error executing code live:", err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-200 font-sans border-l border-[#c8c5d0]/30">
      
      {/* Top Toolbar */}
      <div className="h-11 bg-[#1e1b4b] border-b border-[#444173] px-4 flex items-center justify-between text-xs font-mono">
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#8683ba]">
            <Code className="w-4 h-4 text-[#89f5e7]" />
            <span className="font-semibold text-white">Live Editor</span>
          </div>

          <select
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className="bg-[#070235] text-white border border-[#444173] text-xs py-1 px-3 rounded-lg focus:outline-none focus:border-[#2170e4]"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* Font Size Adjusters */}
          <div className="flex items-center gap-1 bg-[#070235] p-1 rounded-lg border border-[#444173] text-[11px]">
            <button
              onClick={() => setFontSize((s) => Math.max(10, s - 1))}
              className="px-1.5 py-0.5 hover:bg-white/10 rounded text-slate-300"
              title="Decrease Font Size"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-1 text-slate-400 font-mono">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(20, s + 1))}
              className="px-1.5 py-0.5 hover:bg-white/10 rounded text-slate-300"
              title="Increase Font Size"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Run Code Button */}
          <button
            onClick={() => handleRunCode(value)}
            disabled={running}
            className="px-4 py-1.5 bg-[#2170e4] hover:bg-[#0058be] text-white font-semibold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
      <div className="flex-1 min-h-[300px] relative overflow-hidden">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : language}
          value={value}
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
            padding: { top: 12 },
          }}
        />
      </div>

      {/* Stdin Input Section */}
      <div className="h-24 bg-[#0a0f1d] border-t border-slate-800 p-2.5 flex flex-col font-mono text-xs">
        <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Standard Input (stdin)</span>
        <textarea
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          placeholder="Enter execution input arguments here..."
          className="flex-1 bg-[#151d30] text-slate-200 border border-slate-700/60 rounded p-2 text-xs focus:outline-none focus:border-[#2170e4] resize-none"
        />
      </div>

      {/* Output Terminal Section */}
      <div className="h-40 bg-[#070a14] border-t border-slate-800 p-3 font-mono text-xs overflow-y-auto">
        <div className="flex items-center gap-1.5 text-slate-400 mb-1.5 pb-1 border-b border-slate-800 text-[11px] font-bold">
          <Terminal className="w-3.5 h-3.5 text-[#2170e4]" />
          <span>Execution Output Console</span>
        </div>
        <pre className="text-emerald-400 whitespace-pre-wrap">{output || "Console output will be streamed live here after clicking 'Run Code'..."}</pre>
      </div>

    </div>
  );
}