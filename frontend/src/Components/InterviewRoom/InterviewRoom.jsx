import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useLiveInterviewStomp } from "./useLiveInterviewStomp";
import "./InterviewRoom.css";
import VideoCall from "./VideoCall";
import { useAuth } from "../AuthProvider";
import Compiler from "./Compiler";
import api from "../Axios";

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
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copyPasteCount, setCopyPasteCount] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const lastVisibilityChange = useRef(Date.now());

  
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
  } = useLiveInterviewStomp({
    interviewId,
    token,
  });

  const navigate = useNavigate();

  // 🔒 Request fullscreen on mount (for candidates)
  useEffect(() => {
    if (!isHR) {
      const requestFullscreen = async () => {
        try {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
          }
        } catch (err) {
          console.warn("Fullscreen request failed:", err);
          if (sendSecurityFlag) {
            sendSecurityFlag("FULLSCREEN_DENIED", "Failed to enter fullscreen mode");
          }
        }
      };

      requestFullscreen();
    }
  }, [isHR, sendSecurityFlag]);

  // 🚩 Monitor fullscreen exit (for candidates)
  useEffect(() => {
    if (isHR || !sendSecurityFlag) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        sendSecurityFlag("FULLSCREEN_EXIT", "Candidate exited fullscreen mode");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isHR, sendSecurityFlag]);

  // 🚩 Monitor tab visibility (Page Visibility API)
  useEffect(() => {
    if (isHR || !sendSecurityFlag) return;

    const handleVisibilityChange = () => {
      const now = Date.now();
      const timeSinceLastChange = now - lastVisibilityChange.current;

      if (document.hidden) {
        setIsTabVisible(false);
        // Only count if it's been more than 1 second since last change
        if (timeSinceLastChange > 1000) {
          setTabSwitchCount((prev) => {
            const newCount = prev + 1;
            sendSecurityFlag(
              "TAB_SWITCH",
              `Candidate switched tabs/windows (${newCount} times)`,
              { count: newCount }
            );
            return newCount;
          });
        }
      } else {
        setIsTabVisible(true);
      }

      lastVisibilityChange.current = now;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isHR, sendSecurityFlag]);

  // 🚩 Monitor copy/paste events
  useEffect(() => {
    if (isHR || !sendSecurityFlag) return;

    const handleCopy = (e) => {
      setCopyPasteCount((prev) => {
        const newCount = prev + 1;
        sendSecurityFlag(
          "COPY_DETECTED",
          `Candidate copied text (${newCount} times)`,
          { count: newCount, type: "copy" }
        );
        return newCount;
      });
    };

    const handlePaste = (e) => {
      const pastedText = e.clipboardData.getData("text");
      setCopyPasteCount((prev) => {
        const newCount = prev + 1;
        sendSecurityFlag(
          "PASTE_DETECTED",
          `Candidate pasted text (${newCount} times)`,
          {
            count: newCount,
            type: "paste",
            length: pastedText.length,
            preview: pastedText.substring(0, 50),
          }
        );
        return newCount;
      });
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [isHR, sendSecurityFlag]);

  // 🚩 Monitor window blur (when candidate clicks outside browser)
  useEffect(() => {
    if (isHR || !sendSecurityFlag) return;

    const handleWindowBlur = () => {
      sendSecurityFlag("WINDOW_BLUR", "Candidate switched to another application");
    };

    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isHR, sendSecurityFlag]);

  // Handle interview end
  useEffect(() => {
    if (interviewEnded) {
      // Exit fullscreen before navigating
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      navigate(`/history/${user?.role}`);
    }
  }, [interviewEnded, navigate, user]);

  if (!connected) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        color: '#94a3b8',
        fontSize: '18px'
      }}>
        Connecting to interview...
      </div>
    );
  }

  const handleEndInterview = async (interviewId) => {
    try {
      await api.put(`/api/hr/interview/${interviewId}/end`);
    } catch (error) {
      console.error("Error ending interview", error);
    }
  };

  // Get flag severity color
  const getFlagColor = (type) => {
    const severityMap = {
      TAB_SWITCH: "#ef4444",
      COPY_DETECTED: "#f97316",
      PASTE_DETECTED: "#ef4444",
      WINDOW_BLUR: "#eab308",
      FULLSCREEN_EXIT: "#dc2626",
      FULLSCREEN_DENIED: "#dc2626",
    };
    return severityMap[type] || "#94a3b8";
  };

  return (
    <div className="live-interview-root">
      {/* 🚩 Security Monitor Panel (HR Only) */}
      {isHR && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#1e293b",
            borderRadius: "12px",
            padding: "16px",
            maxWidth: "320px",
            maxHeight: "400px",
            overflowY: "auto",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            zIndex: 1000,
            border: "2px solid #334155",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
              color: "#f1f5f9",
              fontWeight: "600",
            }}
          >
            <span style={{ fontSize: "18px" }}>🚩</span>
            <span>Security Flags ({securityFlags.length})</span>
          </div>

          {securityFlags.length === 0 ? (
            <div
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              No suspicious activity detected
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {securityFlags.slice(-10).reverse().map((flag, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#0f172a",
                    borderRadius: "8px",
                    padding: "10px",
                    borderLeft: `3px solid ${getFlagColor(flag.type)}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      marginBottom: "4px",
                    }}
                  >
                    {flag.timestamp.toLocaleTimeString()}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#f1f5f9",
                      fontWeight: "500",
                    }}
                  >
                    {flag.message}
                  </div>
                  {flag.metadata?.preview && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        marginTop: "4px",
                        fontFamily: "monospace",
                        background: "#020617",
                        padding: "4px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      Preview: {flag.metadata.preview}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🔴 Tab Hidden Warning (Candidate Only) */}
      {!isHR && !isTabVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div style={{ fontSize: "64px" }}>⚠️</div>
          <div
            style={{
              color: "#fca5a5",
              fontSize: "24px",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Please return to the interview
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>
            This action has been flagged to the interviewer
          </div>
        </div>
      )}

      {/* MAIN INTERVIEW AREA */}
      <div className="live-interview-main">
        {/* Question Panel */}
        <div className="question-panel">
          <div className="question-panel__header">
            <span className="question-panel__label">Question</span>
            <span className="question-panel__index">#01</span>
          </div>
          <textarea
            className="question-panel__textarea"
            value={question}
            onChange={(e) => updateQuestion(e.target.value)}
            placeholder="Type the interview question here..."
            readOnly={!isHR}
          />
        </div>

        {/* Compiler Panel */}
        <div className="compiler-panel">
          <Compiler
            value={code}
            onChange={(value) => updateCode(value)}
            output={output}
            clearOutput={() => setOutput("")}
            interviewId={interviewId}
          />
        </div>
      </div>

      {/* Video Call Area */}
      <div className="video-call-area">
        {stompClient && (
          <VideoCall
            stompClient={stompClient}
            interviewId={interviewId}
            userId={String(userId)}
            mic={mic}
            camera={camera}
            isHost={isHR}
          />
        )}
      </div>

      {/* End Interview Button */}
      {isHR && (
        <button
          className="end-interview-btn"
          onClick={() => handleEndInterview(interviewId)}
        >
          End Interview
        </button>
      )}
    </div>
  );
};

export default LiveInterview;