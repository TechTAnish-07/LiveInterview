import { useState } from "react";
import Editor from "@monaco-editor/react";
import api from "../Axios";
import { useParams } from "react-router-dom";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "typescript", label: "TypeScript" },
  { id: "go", label: "Go" },
];



export default function Compiler({ value, onChange, output, clearOutput }) {
  const [language, setLanguage] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const interviewId = useParams().id;
  const [stdin, setStdin] = useState("");
  const handleRunCode = (value) => {
    const res = api.post("/api/coding/interview/run", {
      interviewId: interviewId,
      sourceCode: value,
      language,
      stdin: stdin,
    });
  }
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "#1e1e1e",
    }}>

      {/* Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        background: "#2d2d2d",
        borderBottom: "1px solid #3e3e3e",
      }}>

        {/* Language select */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            background: "#3e3e3e",
            border: "1px solid #555",
            borderRadius: 4,
            color: "#d4d4d4",
            fontSize: 13,
            padding: "4px 8px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
        <div style={{ width: "1px", background: "#334155" }} className="run-button" >
          <button onClick={() => {
            clearOutput();
            handleRunCode(value);
          }}> Run</button>
        </div>


        <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
          <button
            onClick={() => setFontSize((s) => Math.max(10, s - 1))}
            style={{
              background: "#3e3e3e", border: "1px solid #555",
              borderRadius: 4, color: "#d4d4d4", cursor: "pointer",
              fontSize: 14, padding: "2px 8px",
            }}
          >−</button>
          <span style={{ color: "#888", fontSize: 12, minWidth: 36, textAlign: "center" }}>
            {fontSize}px
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}></div>
          <button
            onClick={() => setFontSize((s) => Math.min(24, s + 1))}
            style={{
              background: "#3e3e3e", border: "1px solid #555",
              borderRadius: 4, color: "#d4d4d4", cursor: "pointer",
              fontSize: 14, padding: "2px 8px",
            }}
          >+</button>
        </div>


      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Editor
          height="100%"
          language={language}
          value={value}
          theme="vs-dark"
          onChange={onChange}
          options={{

            fontSize,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            lineNumbers: "on",
            tabSize: 2,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
            padding: { top: 12 },
          }}
        />
      </div>
      {/* Input Section */}
      <div
        style={{
          height: "120px",
          borderTop: "1px solid #334155",
          padding: "10px",
          background: "#151515",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <strong style={{ color: "#888", marginBottom: "6px" }}>Input (stdin):</strong>

        <textarea
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          placeholder="Enter custom input here..."
          style={{
            flex: 1,
            background: "#1e1e1e",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: "4px",
            padding: "8px",
            resize: "none",
            fontFamily: "monospace",
            fontSize: "13px",
            outline: "none",
          }}
        />
      </div>

      <div
        style={{
          height: "180px",
          borderTop: "1px solid #334155",
          padding: "12px",
          background: "#111",
          color: "#00ff88",
          fontFamily: "monospace",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        <strong style={{ color: "#888" }}>Output:</strong>
        {console.log("Compiler output:", output)}
        <pre style={{ marginTop: "8px" }}>{output}</pre>
      </div>

    </div>
  );
}