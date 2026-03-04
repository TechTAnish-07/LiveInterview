import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useLiveInterviewStomp } from "./useLiveInterviewStomp";
import VideoCall from "./VideoCall";
import { useAuth } from "../AuthProvider";
import Compiler from "./Compiler";
import api from "../Axios";
import { useWebRTC } from "./useWebRTC";

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
  const [sessionTime, setSessionTime] = useState(0);
  const lastVisibilityChange = useRef(Date.now());
  const [isInterviewActive, setIsInterviewActive] = useState(true);
  const hasCleanedUp = useRef(false);
  const navigate = useNavigate();
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
  const {cleanup} = useWebRTC(
  {
    stompClient,
    interviewId,
    userId,
    isHost: isHR,
  }
)
useEffect(() => {
    const handleUnload = () => {
      if (!hasCleanedUp.current && isInterviewActive) {
        console.log('🚪 Page unloading, cleaning up...');
        cleanup();
        hasCleanedUp.current = true;
      }
    };

    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('unload', handleUnload);
      if (!hasCleanedUp.current) {
        console.log('🔄 Component unmounting, cleaning up...');
        cleanup();
        hasCleanedUp.current = true;
      }
    };
  }, [cleanup, isInterviewActive]);

  

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fullscreen logic
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

  // Security monitoring effects
  useEffect(() => {
    if (isHR || !sendSecurityFlag) return;
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        sendSecurityFlag("FULLSCREEN_EXIT", "Candidate exited fullscreen mode");
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isHR, sendSecurityFlag]);

  useEffect(() => {
    if (isHR || !sendSecurityFlag) return;
    const handleVisibilityChange = () => {
      const now = Date.now();
      const timeSinceLastChange = now - lastVisibilityChange.current;
      if (document.hidden) {
        setIsTabVisible(false);
        if (timeSinceLastChange > 1000) {
          setTabSwitchCount((prev) => {
            const newCount = prev + 1;
            sendSecurityFlag("TAB_SWITCH", `Candidate switched tabs/windows (${newCount} times)`, { count: newCount });
            return newCount;
          });
        }
      } else {
        setIsTabVisible(true);
      }
      lastVisibilityChange.current = now;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isHR, sendSecurityFlag]);

  useEffect(() => {
    if (isHR || !sendSecurityFlag) return;
    const handleCopy = () => {
      setCopyPasteCount((prev) => {
        const newCount = prev + 1;
        sendSecurityFlag("COPY_DETECTED", `Candidate copied text (${newCount} times)`, { count: newCount, type: "copy" });
        return newCount;
      });
    };
    const handlePaste = (e) => {
      const pastedText = e.clipboardData.getData("text");
      setCopyPasteCount((prev) => {
        const newCount = prev + 1;
        sendSecurityFlag("PASTE_DETECTED", `Candidate pasted text (${newCount} times)`, {
          count: newCount,
          type: "paste",
          length: pastedText.length,
          preview: pastedText.substring(0, 50),
        });
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

  useEffect(() => {
    if (isHR || !sendSecurityFlag) return;
    const handleWindowBlur = () => {
      sendSecurityFlag("WINDOW_BLUR", "Candidate switched to another application");
    };
    window.addEventListener("blur", handleWindowBlur);
    return () => window.removeEventListener("blur", handleWindowBlur);
  }, [isHR, sendSecurityFlag]);

  useEffect(() => {
    if (interviewEnded) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      navigate(`/dashboard/${user?.role}`);
    }
  }, [interviewEnded, navigate, user]);

  if (!connected) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <div style={styles.loadingText}>Establishing secure connection...</div>
      </div>
    );
  }

  const handleEndInterview = async (interviewId) => {
  
    console.log('🔴 Ending interview and cleaning up media...');
    
    try {
  
      hasCleanedUp.current = true;
      setIsInterviewActive(false);
      
      cleanup();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await api.put(`/api/hr/interview/${interviewId}/end`);
      
      console.log('✅ Interview ended successfully');
      
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(err => 
          console.log('Fullscreen exit error:', err)
        );
      }
      
    } catch (error) {
      console.error("❌ Error ending interview:", error);
    }
  };
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFlagColor = (type) => {
    const severityMap = {
      TAB_SWITCH: "#ef4444",
      COPY_DETECTED: "#f59e0b",
      PASTE_DETECTED: "#ef4444",
      WINDOW_BLUR: "#eab308",
      FULLSCREEN_EXIT: "#dc2626",
      FULLSCREEN_DENIED: "#dc2626",
    };
    return severityMap[type] || "#64748b";
  };

  const getFlagIcon = (type) => {
    const iconMap = {
      TAB_SWITCH: "⚠️",
      COPY_DETECTED: "📋",
      PASTE_DETECTED: "📝",
      WINDOW_BLUR: "🔄",
      FULLSCREEN_EXIT: "⛔",
      FULLSCREEN_DENIED: "🚫",
    };
    return iconMap[type] || "🚩";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        
        * { box-sizing: border-box; }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.3); }
          50% { box-shadow: 0 0 30px rgba(14, 165, 233, 0.6); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Scrollbar styles */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
        ::-webkit-scrollbar-thumb { background: rgba(14, 165, 233, 0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(14, 165, 233, 0.5); }
      `}</style>

      <div style={styles.container}>
        {/* Top Status Bar */}
        <div style={styles.statusBar}>
          <div style={styles.statusLeft}>
            <div style={styles.liveBadge}>
              <span style={styles.liveDot} />
              LIVE INTERVIEW
            </div>
            <div style={styles.sessionInfo}>
              <span style={styles.sessionLabel}>Session Time:</span>
              <span style={styles.sessionValue}>{formatTime(sessionTime)}</span>
            </div>
            <div style={styles.sessionInfo}>
              <span style={styles.sessionLabel}>ID:</span>
              <span style={styles.sessionValue}>#{interviewId}</span>
            </div>
          </div>
          
          <div style={styles.statusRight}>
            {isHR && (
              <button style={styles.endButton} onClick={() => handleEndInterview(interviewId)}>
                <span style={styles.endIcon}>⏹</span>
                End Interview
              </button>
            )}
          </div>
        </div>

        {/* Main Interview Grid */}
        <div style={styles.mainGrid}>
          {/* Left Column - Question & Code */}
          <div style={styles.leftColumn}>
            {/* Question Panel */}
            <div style={styles.questionCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <span style={styles.cardIcon}>💭</span>
                  <span>Interview Question</span>
                </div>
                <div style={styles.questionBadge}>Q1</div>
              </div>
              <textarea
                style={styles.questionTextarea}
                value={question}
                onChange={(e) => updateQuestion(e.target.value)}
                placeholder="Type or paste the interview question here..."
                readOnly={!isHR}
              />
            </div>

            {/* Code Editor Panel */}
            <div style={styles.codeCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <span style={styles.cardIcon}>⌨️</span>
                  <span>Code Editor</span>
                </div>
              
              </div>
              <div style={styles.compilerWrapper}>
                <Compiler
                  value={code}
                  onChange={(value) => updateCode(value)}
                  output={output}
                  clearOutput={() => setOutput("")}
                  interviewId={interviewId}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Video & Security */}
          <div style={styles.rightColumn}>
            {/* Video Call */}
            <div style={styles.videoCard}>
              <div style={styles.videoHeader}>
                <span style={styles.videoTitle}>
                  <span style={styles.cardIcon}>🎥</span>
                  Live Session
                </span>
                <div style={styles.encryptionBadge}>
                  <span style={styles.lockIcon}>🔒</span>
                  <span>Encrypted</span>
                </div>
              </div>
              <div style={styles.videoWrapper}>
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
            </div>

            {/* Security Monitor (HR Only) */}
            {isHR && (
              <div style={styles.securityCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>
                    <span style={styles.cardIcon}>🛡️</span>
                    <span>Security Monitor</span>
                  </div>
                  <div style={styles.flagCount}>
                    {securityFlags.length}
                  </div>
                </div>
                
                <div style={styles.securityContent}>
                  {securityFlags.length === 0 ? (
                    <div style={styles.noFlags}>
                      <div style={styles.checkIcon}>✓</div>
                      <div style={styles.noFlagsText}>All Clear</div>
                      <div style={styles.noFlagsSubtext}>No suspicious activity detected</div>
                    </div>
                  ) : (
                    <div style={styles.flagsList}>
                      {securityFlags.slice(-5).reverse().map((flag, idx) => (
                        <div
                          key={idx}
                          style={{
                            ...styles.flagItem,
                            animation: 'slideInRight 0.3s ease-out',
                            animationDelay: `${idx * 0.05}s`,
                          }}
                        >
                          <div style={styles.flagTop}>
                            <span style={styles.flagEmoji}>{getFlagIcon(flag.type)}</span>
                            <span style={styles.flagTime}>
                              {flag.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div style={styles.flagMessage}>{flag.message}</div>
                          {flag.metadata?.preview && (
                            <div style={styles.flagPreview}>
                              <code style={styles.flagCode}>{flag.metadata.preview}...</code>
                            </div>
                          )}
                          <div
                            style={{
                              ...styles.flagIndicator,
                              background: getFlagColor(flag.type),
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Warning Overlay (Candidate) */}
        {!isHR && !isTabVisible && (
          <div style={styles.warningOverlay}>
            <div style={styles.warningCard}>
              <div style={styles.warningIcon}>⚠️</div>
              <div style={styles.warningTitle}>Interview Window Inactive</div>
              <div style={styles.warningMessage}>
                Please return to the interview immediately
              </div>
              <div style={styles.warningSubtext}>
                This action has been logged and flagged to the interviewer
              </div>
              <div style={styles.warningCount}>
                Switches: {tabSwitchCount}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
 
  container: {
    width: '100%',
    minHeight: '100vh',
      background: 'linear-gradient(180deg,rgb(10, 19, 58) 0%,rgb(4, 7, 22) 100%)',
    fontFamily: "'Outfit', sans-serif",
    color: '#e2e8f0',
    position: 'relative',
    overflow: 'hidden',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg,rgb(13, 24, 51) 0%, #1e293b 100%)',
    gap: '24px',
  },
  loadingSpinner: {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(62, 176, 228, 0.1)',
    borderTop: '4px solid #0ea5e9',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    color: '#cbd5e1',
    fontWeight: '500',
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: 'rgba(24, 34, 58, 0.8)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  liveBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#ef4444',
    letterSpacing: '0.5px',
  },
  liveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#ef4444',
    animation: 'pulseGlow 2s ease-in-out infinite',
  },
  sessionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  sessionLabel: {
    color: '#64748b',
    fontWeight: '500',
  },
  sessionValue: {
    color: '#e2e8f0',
    fontWeight: '600',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  statusRight: {
    display: 'flex',
    gap: '12px',
  },
  endButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
  },
  endIcon: {
    fontSize: '16px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 450px',
    gap: '24px',
    padding: '24px',
    height: 'calc(100vh - 72px)',
    overflow: 'hidden',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflow: 'hidden',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflow: 'hidden',
  },
  questionCard: {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    flex: '0 0 auto',
    animation: 'fadeIn 0.4s ease-out',
  },
  codeCard: {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'fadeIn 0.4s ease-out 0.1s backwards',
  },
  videoCard: {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'fadeIn 0.4s ease-out 0.2s backwards',
  },
  securityCard: {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    maxHeight: '400px',
    animation: 'fadeIn 0.4s ease-out 0.3s backwards',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  cardIcon: { fontSize: '18px', },
  questionBadge: {
    background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff',
  },
  languageBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(14, 165, 233, 0.1)',
    border: '1px solid rgba(14, 165, 233, 0.3)',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#0ea5e9',
  },
  langDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#0ea5e9',
  },
  questionTextarea: {
    width: '100%',
    minHeight: '120px',
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    color: '#e2e8f0',
    fontSize: '15px',
    fontFamily: "'Outfit', sans-serif",
    lineHeight: '1.6',
    resize: 'vertical',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  compilerWrapper: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: '12px',
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
  },
  videoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  videoTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  encryptionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#22c55e',
  },
  lockIcon: { fontSize: '12px', },
  videoWrapper: {
    flex: 1,
    borderRadius: '12px',
    overflow: 'hidden',
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
  },
  flagCount: {
    minWidth: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#ef4444',
  },
  securityContent: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  noFlags: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  checkIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'rgba(34, 197, 94, 0.15)',
    border: '2px solid rgba(34, 197, 94, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    color: '#22c55e',
  },
  noFlagsText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  noFlagsSubtext: {
    fontSize: '13px',
    color: '#64748b',
  },
  flagsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  flagItem: {
    background: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '10px',
    padding: '12px',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(148, 163, 184, 0.1)',
  },
  flagTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  flagEmoji: { fontSize: '16px', },
  flagTime: {
    fontSize: '11px',
    color: '#64748b',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  flagMessage: {
    fontSize: '13px',
    color: '#e2e8f0',
    fontWeight: '500',
    lineHeight: '1.5',
    marginBottom: '4px',
  },
  flagPreview: {
    marginTop: '8px',
    padding: '8px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '6px',
    border: '1px solid rgba(148, 163, 184, 0.1)',
  },
  flagCode: {
    fontSize: '11px',
    fontFamily: "'IBM Plex Mono', monospace",
    color: '#94a3b8',
  },
  flagIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '3px',
  },
  warningOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    animation: 'fadeIn 0.3s ease-out',
  },
  warningCard: {
    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(185, 28, 28, 0.1))',
    backdropFilter: 'blur(20px)',
    border: '2px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '24px',
    padding: '48px',
    maxWidth: '500px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(220, 38, 38, 0.3)',
  },
  warningIcon: {
    fontSize: '80px',
    marginBottom: '24px',
    animation: 'pulseGlow 2s ease-in-out infinite',
  },
  warningTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fca5a5',
    marginBottom: '12px',
  },
  warningMessage: {
    fontSize: '16px',
    color: '#e2e8f0',
    marginBottom: '8px',
    fontWeight: '500',
  },
  warningSubtext: {
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '24px',
  },
  warningCount: {
    display: 'inline-block',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ef4444',
    fontFamily: "'IBM Plex Mono', monospace",
  },
};

export default LiveInterview;