import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import api from "../Axios";
import { Code, Play, CheckCircle2, AlertCircle, RefreshCw, Terminal, Layers, HelpCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DEFAULT_CODE_TEMPLATES = {
  python: `def solution(nums, target):\n    # Write your solution here\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i\n    return []\n\nprint(solution([2, 7, 11, 15], 9))`,
  javascript: `function solution(nums, target) {\n  // Write your solution here\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (seen.has(diff)) return [seen.get(diff), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(solution([2, 7, 11, 15], 9));`,
  java: `public class Solution {\n    public static void main(String[] args) {\n        System.out.println("LiveInterview Practice Solution Executed");\n    }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "LiveInterview C++ Practice Environment" << endl;\n    return 0;\n}`,
  go: `package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("LiveInterview Go Environment")\n}`
};

const LANGUAGE_IDS = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
  go: 60
};

const Practice = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_CODE_TEMPLATES.python);
  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/practiceQuestions");
        const list = Array.isArray(res.data) ? res.data : [];
        setQuestions(list);
        if (list.length > 0) {
          setSelectedQuestion(list[0]);
        }
      } catch (err) {
        console.error("Error fetching practice questions:", err);
        // Fallback sample question if DB is empty
        setSelectedQuestion({
          id: 1,
          title: "Two Sum",
          difficulty: "EASY",
          description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
          sampleInput: "nums = [2,7,11,15], target = 9",
          sampleOutput: "[0,1]"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(DEFAULT_CODE_TEMPLATES[newLang] || "");
  };

  const handleRunCode = async () => {
    setRunning(true);
    setError("");
    setOutput(null);

    try {
      const payload = {
        questionId: selectedQuestion?.id || 1,
        sourceCode: code,
        language: LANGUAGE_IDS[language] || 71,
        stdin: stdin || selectedQuestion?.sampleInput || ""
      };

      const res = await api.post("/api/practice/submit", payload);
      setOutput(res.data);
    } catch (err) {
      console.error("Code submission error:", err);
      setError(err.response?.data?.message || err.message || "Failed to execute code.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#f7f9fb] text-[#191c1e] font-sans flex flex-col">
      
      {/* Top Bar */}
      <div className="bg-[#070235] text-white px-6 py-3 border-b border-[#1e1b4b] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg bg-[#1e1b4b] text-[#8683ba] hover:text-white transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2170e4] flex items-center justify-center text-white">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight leading-tight">Practice Studio</h1>
              <span className="text-[10px] font-mono text-[#8683ba]">Algorithmic Coding Environment</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-[#1e1b4b] text-white border border-[#444173] text-xs font-mono py-1.5 px-3 rounded-lg focus:outline-none focus:border-[#2170e4]"
          >
            <option value="python">Python (3.8.1)</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="java">Java (OpenJDK 13)</option>
            <option value="cpp">C++ (GCC 9.2.0)</option>
            <option value="go">Go (1.13.5)</option>
          </select>

          <button
            onClick={handleRunCode}
            disabled={running}
            className="px-5 py-1.5 bg-[#2170e4] hover:bg-[#0058be] text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {running ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing...</span>
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

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side: Question Statement */}
        <div className="w-full md:w-1/3 bg-white border-r border-[#e0e3e5] flex flex-col overflow-y-auto">
          
          {/* Question List Switcher */}
          {questions.length > 1 && (
            <div className="p-3 bg-[#f2f4f6] border-b border-[#e0e3e5] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0058be]" />
              <select
                value={selectedQuestion?.id || ""}
                onChange={(e) => {
                  const q = questions.find(item => item.id === Number(e.target.value));
                  if (q) setSelectedQuestion(q);
                }}
                className="w-full text-xs font-semibold bg-white border border-[#c8c5d0] rounded-lg p-1.5"
              >
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>{q.title || `Question #${q.id}`}</option>
                ))}
              </select>
            </div>
          )}

          {/* Problem Statement Header */}
          <div className="p-6 border-b border-[#e0e3e5] space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                selectedQuestion?.difficulty === "HARD"
                  ? "bg-[#ffdad6] text-[#93000a]"
                  : selectedQuestion?.difficulty === "MEDIUM"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}>
                {selectedQuestion?.difficulty || "EASY"}
              </span>
              <span className="text-[11px] font-mono text-[#787680]">Problem ID #{selectedQuestion?.id || 1}</span>
            </div>

            <h2 className="text-xl font-extrabold text-[#070235]">
              {selectedQuestion?.title || "Two Sum"}
            </h2>
          </div>

          {/* Description Body */}
          <div className="p-6 space-y-6 text-xs text-[#191c1e] leading-relaxed flex-1">
            
            <div>
              <h3 className="font-mono font-bold text-[11px] uppercase tracking-wider text-[#47464f] mb-2">Description</h3>
              <p className="bg-[#f7f9fb] p-4 rounded-xl border border-[#e0e3e5]">
                {selectedQuestion?.description || "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."}
              </p>
            </div>

            {selectedQuestion?.sampleInput && (
              <div>
                <h3 className="font-mono font-bold text-[11px] uppercase tracking-wider text-[#47464f] mb-1.5">Sample Input</h3>
                <pre className="bg-[#0f172a] text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <code>{selectedQuestion.sampleInput}</code>
                </pre>
              </div>
            )}

            {selectedQuestion?.sampleOutput && (
              <div>
                <h3 className="font-mono font-bold text-[11px] uppercase tracking-wider text-[#47464f] mb-1.5">Sample Output</h3>
                <pre className="bg-[#0f172a] text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <code>{selectedQuestion.sampleOutput}</code>
                </pre>
              </div>
            )}

          </div>

        </div>

        {/* Right Side: Code Editor & Console */}
        <div className="flex-1 bg-[#0f172a] flex flex-col overflow-hidden">
          
          {/* Monaco Editor */}
          <div className="flex-1 min-h-[350px] relative">
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                fontSize: 13,
                fontFamily: "JetBrains Mono, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Terminal Output Drawer */}
          <div className="h-56 bg-[#070a14] border-t border-slate-800 p-4 font-mono text-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5 text-xs text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-[#2170e4]" />
                Execution Terminal
              </span>
              {output && (
                <span className="text-[10px] text-emerald-400 font-bold">
                  Status: {output.status?.description || output.status || "Executed"}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto text-slate-300 space-y-1">
              {running ? (
                <p className="text-yellow-400 animate-pulse">Running compilation via Judge0 engine...</p>
              ) : error ? (
                <p className="text-red-400 font-semibold">{error}</p>
              ) : output ? (
                <div>
                  {output.stdout && (
                    <div className="text-emerald-400">
                      <span className="text-slate-500 font-bold">Output:</span>
                      <pre className="mt-1 whitespace-pre-wrap">{output.stdout}</pre>
                    </div>
                  )}
                  {output.stderr && (
                    <div className="text-red-400">
                      <span className="text-slate-500 font-bold">Error:</span>
                      <pre className="mt-1 whitespace-pre-wrap">{output.stderr}</pre>
                    </div>
                  )}
                  {output.compileOutput && (
                    <div className="text-amber-400">
                      <span className="text-slate-500 font-bold">Compile Log:</span>
                      <pre className="mt-1 whitespace-pre-wrap">{output.compileOutput}</pre>
                    </div>
                  )}
                  {output.time && (
                    <div className="mt-2 text-[10px] text-slate-500">
                      Execution Time: {output.time}s | Memory: {output.memory}KB
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 italic">Click "Run Code" above to compile and view stdout test outputs.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Practice;