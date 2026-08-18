import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Room, RoomEvent, Track, setLogLevel } from "livekit-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Bot, AlertCircle, Loader2, ShieldCheck, UserCheck, Activity, Camera, Code2, Video as VideoIcon, GripVertical, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import AiCodingPanel from "./AiCodingPanel";

// Suppress internal LiveKit connection info/debug logs containing tokens and internal state transitions
setLogLevel("warn");

export default function AiInterviewRoom() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = location.state || {};
  const { roomName, token, livekitUrl, jobRole, sessionId } = stateData;

  const roomRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const isResizingRef = useRef(false);

  const [connectionState, setConnectionState] = useState("INITIALIZING"); // INITIALIZING, CONNECTING, CONNECTED, DISCONNECTED, ERROR
  const [agentJoined, setAgentJoined] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Coding round & data channel states
  const [showCodingPanel, setShowCodingPanel] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(380); // Resizable sidebar width in px
  const [questionText, setQuestionText] = useState("");
  const [code, setCode] = useState("# Write your solution here...\n");
  const [language, setLanguage] = useState("python");
  const [isSyncing, setIsSyncing] = useState(false);
  const [mobileTab, setMobileTab] = useState("editor"); // 'video' | 'editor'

  const codeRef = useRef(code);
  const languageRef = useRef(language);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Drag-to-resize sidebar logic
  const startResizing = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (mouseMoveEvent) => {
      if (!isResizingRef.current) return;
      const minW = 280;
      const maxW = Math.min(650, window.innerWidth - 350);
      const newWidth = Math.max(minW, Math.min(maxW, mouseMoveEvent.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Redirect if route state is missing
  useEffect(() => {
    if (!token || !livekitUrl || !roomName) {
      console.warn("Missing LiveKit connection parameters. Redirecting to entry page.");
      navigate("/ai-interview", { replace: true });
    }
  }, [token, livekitUrl, roomName, navigate]);

  // Main LiveKit & Media Permission Lifecycle
  useEffect(() => {
    if (!token || !livekitUrl) return;

    let isMounted = true;
    const room = new Room();
    roomRef.current = room;

    const initAndConnect = async () => {
      try {
        // 1. Request microphone & camera permissions
        setConnectionState("REQUESTING_PERMISSIONS");
        let mediaStream = null;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        } catch (mediaErr) {
          console.warn("Could not obtain video stream, falling back to audio only:", mediaErr);
          mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setCameraEnabled(false);
        }
        mediaStreamRef.current = mediaStream;

        if (!isMounted) return;

        // 2. Setup LiveKit Event Listeners
        room.on(RoomEvent.Connected, () => {
          if (!isMounted) return;
          setConnectionState("CONNECTED");

          if (room.remoteParticipants.size > 0) {
            setAgentJoined(true);
          }
        });

        room.on(RoomEvent.Disconnected, () => {
          if (!isMounted) return;
          setConnectionState("DISCONNECTED");
          setAgentJoined(false);
          // Automatically navigate to dashboard after interview ends.
          setTimeout(() => {
            if (isMounted) navigate("/dashboard/candidate", { replace: true });
          }, 3000);
        });

        room.on(RoomEvent.ParticipantConnected, () => {
          if (!isMounted) return;
          setAgentJoined(true);
        });

        room.on(RoomEvent.ParticipantDisconnected, () => {
          if (!isMounted) return;
          if (room.remoteParticipants.size === 0) {
            setAgentJoined(false);
            setHasRemoteVideo(false);
          }
        });

        room.on(RoomEvent.TrackSubscribed, (track, publication) => {
          if (!isMounted) return;
          if (track.kind === Track.Kind.Audio) {
            // Attach agent audio to a new <audio> element so the user hears the agent's voice
            const audioEl = track.attach();
            audioEl.autoplay = true;
            audioEl.id = `audio-${publication.trackSid}`;
            document.body.appendChild(audioEl);
          }
          if (track.kind === Track.Kind.Video && remoteVideoRef.current) {
            track.attach(remoteVideoRef.current);
            setHasRemoteVideo(true);
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track, publication) => {
          if (track.kind === Track.Kind.Audio) {
            track.detach();
            const audioEl = document.getElementById(`audio-${publication.trackSid}`);
            if (audioEl) audioEl.remove();
          }
          if (track.kind === Track.Kind.Video) {
            track.detach();
            setHasRemoteVideo(false);
          }
        });

        // Listen for Data Channel messages from Agent (e.g. coding_question)
        room.on(RoomEvent.DataReceived, (payload) => {
          if (!isMounted) return;
          try {
            const text = new TextDecoder().decode(payload);
            const data = JSON.parse(text);

            if (
              data.type === "coding_question" ||
              data.type === "question" ||
              data.type === "coding_round" ||
              data.questionText ||
              data.question
            ) {
              const qText = data.questionText || data.question || data.text || "";
              if (qText) {
                setQuestionText(qText);
                setShowCodingPanel(true);
              }
              if (data.language) {
                setLanguage(data.language.toLowerCase());
              }
              if (data.initialCode || data.code) {
                setCode(data.initialCode || data.code);
              }
            } else if (data.type === "hide_coding_question" || data.type === "end_coding_round") {
              setShowCodingPanel(false);
            }
          } catch (err) {
            console.warn("Failed to parse LiveKit data message:", err);
          }
        });

        room.on(RoomEvent.Reconnecting, () => {
          if (!isMounted) return;
          setConnectionState("RECONNECTING");
        });

        room.on(RoomEvent.Reconnected, () => {
          if (!isMounted) return;
          setConnectionState("CONNECTED");
        });

        // 3. Connect to room
        setConnectionState("CONNECTING");
        await room.connect(livekitUrl, token);

        // 4. Enable local audio & video tracks
        await room.localParticipant.setMicrophoneEnabled(true);
        setMicEnabled(true);

        try {
          await room.localParticipant.setCameraEnabled(true);
          setCameraEnabled(true);

          // Attach local video track to preview element
          setTimeout(() => {
            const videoPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
            if (videoPub && videoPub.videoTrack && localVideoRef.current) {
              videoPub.videoTrack.attach(localVideoRef.current);
            }
          }, 300);
        } catch (camErr) {
          console.warn("Could not enable camera in room:", camErr);
          setCameraEnabled(false);
        }

      } catch (err) {
        console.error("LiveKit room initialization error:", err);
        if (!isMounted) return;

        setConnectionState("ERROR");
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMessage("Microphone/Camera permission was denied. Please allow device access in your browser.");
        } else {
          setErrorMessage(err.message || "Failed to connect to AI interview room.");
        }
      }
    };

    initAndConnect();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, [token, livekitUrl]);

  // Debounced code publishing to LiveKit data channel
  const handleCodeChange = (newCode) => {
    const updatedCode = newCode || "";
    setCode(updatedCode);
    setIsSyncing(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (roomRef.current && roomRef.current.state === "connected") {
        try {
          const payloadData = {
            type: "code_update",
            code: updatedCode,
            language: languageRef.current,
            timestamp: Date.now(),
          };
          const encoded = new TextEncoder().encode(JSON.stringify(payloadData));
          await roomRef.current.localParticipant.publishData(encoded, { reliable: true });
          setIsSyncing(false);
        } catch (publishErr) {
          console.error("Failed to publish code_update to LiveKit room:", publishErr);
          setIsSyncing(false);
        }
      } else {
        setIsSyncing(false);
      }
    }, 1800);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (roomRef.current && roomRef.current.state === "connected") {
      try {
        const payloadData = {
          type: "code_update",
          code: codeRef.current,
          language: newLang,
          timestamp: Date.now(),
        };
        const encoded = new TextEncoder().encode(JSON.stringify(payloadData));
        roomRef.current.localParticipant.publishData(encoded, { reliable: true });
      } catch (err) {
        console.warn("Failed to publish language update to LiveKit room:", err);
      }
    }
  };

  const handleCodeRunResult = async (runResult) => {
    if (roomRef.current && roomRef.current.state === "connected") {
      try {
        const payloadData = {
          type: "code_run_result",
          code: runResult.code || codeRef.current,
          stdout: runResult.stdout || "",
          stderr: runResult.stderr || "",
          status: runResult.status || "Unknown",
          timestamp: Date.now(),
        };
        const encoded = new TextEncoder().encode(JSON.stringify(payloadData));
        await roomRef.current.localParticipant.publishData(encoded, { reliable: true });
      } catch (err) {
        console.error("Failed to publish code_run_result to LiveKit room:", err);
      }
    }
  };

  const toggleMic = async () => {
    if (!roomRef.current || connectionState !== "CONNECTED") return;
    try {
      const nextState = !micEnabled;
      await roomRef.current.localParticipant.setMicrophoneEnabled(nextState);
      setMicEnabled(nextState);
    } catch (err) {
      console.error("Error toggling mic:", err);
    }
  };

  const toggleCamera = async () => {
    if (!roomRef.current || connectionState !== "CONNECTED") return;
    try {
      const nextState = !cameraEnabled;
      await roomRef.current.localParticipant.setCameraEnabled(nextState);
      setCameraEnabled(nextState);

      if (nextState && localVideoRef.current) {
        setTimeout(() => {
          const videoPub = roomRef.current?.localParticipant.getTrackPublication(Track.Source.Camera);
          if (videoPub && videoPub.videoTrack && localVideoRef.current) {
            videoPub.videoTrack.attach(localVideoRef.current);
          }
        }, 300);
      }
    } catch (err) {
      console.error("Error toggling camera:", err);
    }
  };

  const handleLeaveInterview = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (roomRef.current) {
      roomRef.current.disconnect();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    navigate("/dashboard/candidate");
  };

  // Re-attach video stream if camera was toggled or DOM mounted
  useEffect(() => {
    if (cameraEnabled && roomRef.current && connectionState === "CONNECTED" && localVideoRef.current) {
      const videoPub = roomRef.current.localParticipant?.getTrackPublication(Track.Source.Camera);
      if (videoPub && videoPub.videoTrack) {
        videoPub.videoTrack.attach(localVideoRef.current);
      }
    }
  }, [cameraEnabled, connectionState, showCodingPanel]);

  // Video Feeds Component (reusable in both standalone and split view)
  const renderVideoStage = (isSplitView = false) => (
    <div className={`grid ${isSplitView ? "grid-cols-1 gap-3" : "grid-cols-1 md:grid-cols-2 gap-4"}`}>
      {/* AI Agent / Remote Stage */}
      <div className={`bg-[#0f172a] rounded-2xl p-4 border border-[#444173] shadow-inner relative overflow-hidden flex flex-col items-center justify-center ${isSplitView ? "min-h-[190px] h-[190px]" : "min-h-[260px]"}`}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`absolute inset-0 w-full h-full object-cover ${hasRemoteVideo ? "block" : "hidden"}`}
        />

        {!hasRemoteVideo && (
          <div className="flex flex-col items-center justify-center text-center space-y-2 z-10">
            <div className="relative">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                agentJoined 
                  ? "bg-gradient-to-tr from-[#0058be] to-[#89f5e7] text-[#070235] shadow-lg shadow-[#89f5e7]/20" 
                  : "bg-[#1e1b4b] text-[#8683ba] border border-[#444173]"
              }`}>
                <Bot className="w-7 h-7" />
              </div>

              {agentJoined && (
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0f172a] flex items-center justify-center text-white" title="Agent Joined">
                  <UserCheck className="w-3 h-3" />
                </span>
              )}
            </div>

            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white">
                {agentJoined ? "AI Interviewer Present" : connectionState === "CONNECTED" ? "Waiting for AI Agent..." : "Initializing Room..."}
              </h3>
              {!isSplitView && (
                <p className="text-xs text-[#8683ba] max-w-xs">
                  {agentJoined ? "The AI agent is listening and ready for your responses." : "Connecting to LiveKit room..."}
                </p>
              )}
            </div>

            {agentJoined && (
              <div className="flex items-center gap-1 text-[10px] font-mono text-[#89f5e7] bg-[#89f5e7]/10 px-2.5 py-0.5 rounded-full border border-[#89f5e7]/20">
                <Activity className="w-3 h-3 animate-pulse" />
                <span>Audio Channel Active</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Candidate Local Video Camera Preview Stage */}
      <div className={`bg-[#0f172a] rounded-2xl border border-[#444173] shadow-inner relative overflow-hidden flex items-center justify-center ${isSplitView ? "min-h-[190px] h-[190px]" : "min-h-[260px]"}`}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover -scale-x-100 ${cameraEnabled ? "block" : "hidden"}`}
        />

        {!cameraEnabled && (
          <div className="flex flex-col items-center justify-center text-[#8683ba] gap-1 p-4 text-center">
            <Camera className="w-8 h-8 text-[#444173]" />
            <span className="text-[11px] font-mono">Candidate Camera Off</span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-mono flex items-center gap-1.5 border border-white/10">
          <span className={`w-1.5 h-1.5 rounded-full ${micEnabled ? "bg-emerald-400" : "bg-red-400"}`}></span>
          <span>{micEnabled ? "Mic Active" : "Muted"}</span>
        </div>
      </div>
    </div>
  );

  // Controls Component
  const renderControls = (isCompact = false) => (
    <div className={`grid ${isCompact ? "grid-cols-3 gap-2" : "grid-cols-1 sm:grid-cols-3 gap-3"} pt-2`}>
      <button
        onClick={toggleMic}
        disabled={connectionState !== "CONNECTED"}
        className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer disabled:opacity-40 ${
          micEnabled 
            ? "bg-[#3b82f6]/20 border-[#3b82f6] text-white hover:bg-[#3b82f6]/30" 
            : "bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30"
        }`}
      >
        {micEnabled ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
        <span>{micEnabled ? "Mic On" : "Muted"}</span>
      </button>

      <button
        onClick={toggleCamera}
        disabled={connectionState !== "CONNECTED"}
        className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer disabled:opacity-40 ${
          cameraEnabled 
            ? "bg-[#3b82f6]/20 border-[#3b82f6] text-white hover:bg-[#3b82f6]/30" 
            : "bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30"
        }`}
      >
        {cameraEnabled ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-red-400" />}
        <span>{cameraEnabled ? "Cam On" : "Cam Off"}</span>
      </button>

      <button
        onClick={handleLeaveInterview}
        className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <PhoneOff className="w-4 h-4" />
        <span>Leave</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070235] text-white font-sans flex flex-col relative overflow-hidden selection:bg-[#d8e2ff]">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[400px] bg-[#2170e4]/15 blur-[140px] rounded-full pointer-events-none"></div>

      {/* Top Header Bar */}
      <header className="h-14 bg-[#070235] border-b border-[#444173]/70 px-4 md:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#2170e4] flex items-center justify-center text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight leading-none">
              {jobRole || "AI Technical Interview"}
            </h2>
            <span className="text-[10px] text-[#8683ba] font-mono">Room: {roomName || "Session"}</span>
          </div>
        </div>

        {/* Header Action Buttons & Status */}
        <div className="flex items-center gap-3">
          {/* Always Available Code Editor Toggle Button */}
          <button
            onClick={() => setShowCodingPanel(!showCodingPanel)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showCodingPanel
                ? "bg-[#2170e4] text-white border-[#2170e4] shadow-md shadow-[#2170e4]/20"
                : "bg-[#1e1b4b] text-[#8683ba] border-[#444173] hover:text-white hover:border-[#8683ba]"
            }`}
            title="Toggle Code Editor"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">{showCodingPanel ? "Hide Editor" : "Code Editor"}</span>
            {questionText && !showCodingPanel && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Coding question available"></span>
            )}
          </button>

          {/* Mobile Tab Switcher (Visible on mobile when editor is open) */}
          {showCodingPanel && (
            <div className="flex md:hidden bg-[#1e1b4b] border border-[#444173] rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setMobileTab("video")}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold transition-all ${
                  mobileTab === "video" ? "bg-[#2170e4] text-white shadow-xs" : "text-[#8683ba]"
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5" />
                <span>Video</span>
              </button>
              <button
                onClick={() => setMobileTab("editor")}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold transition-all ${
                  mobileTab === "editor" ? "bg-[#2170e4] text-white shadow-xs" : "text-[#8683ba]"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>
            </div>
          )}

          {/* Room Connection Status */}
          <div className="flex items-center gap-2">
            {connectionState === "CONNECTED" && (
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Connected</span>
              </span>
            )}
            {(connectionState === "CONNECTING" || connectionState === "REQUESTING_PERMISSIONS") && (
              <span className="px-2.5 py-1 bg-[#0058be]/20 text-[#89f5e7] border border-[#0058be]/40 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{connectionState === "REQUESTING_PERMISSIONS" ? "Permissions..." : "Connecting..."}</span>
              </span>
            )}
            {connectionState === "DISCONNECTED" && (
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[11px] font-mono font-bold">
                Disconnected
              </span>
            )}
            {connectionState === "ERROR" && (
              <span className="px-2.5 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full text-[11px] font-mono font-bold">
                Error
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 flex overflow-hidden relative z-10">

        {/* View Mode 1: Split Coding + Video Workspace with Draggable Divider */}
        {showCodingPanel ? (
          <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Sidebar: Video & Controls (Resizable on md+) */}
            <aside
              style={{ width: `${sidebarWidth}px` }}
              className={`bg-[#1e1b4b] p-4 flex flex-col justify-between shrink-0 overflow-y-auto max-w-[80vw] ${
                mobileTab === "video" ? "w-full flex" : "hidden md:flex"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#444173]/60">
                  <span className="text-xs font-mono font-bold uppercase text-[#8683ba] flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-[#89f5e7]" />
                    AI Video Session
                  </span>
                  {agentJoined && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Live
                    </span>
                  )}
                </div>

                {/* Video Feeds */}
                {renderVideoStage(true)}

                {/* Disconnected Banner */}
                {connectionState === "DISCONNECTED" && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center text-xs text-amber-200">
                    Interview session ended. Redirecting...
                  </div>
                )}
              </div>

              {/* Bottom Controls */}
              <div className="space-y-2 pt-3 border-t border-[#444173]/60 mt-4">
                {renderControls(true)}
                <p className="text-[10px] text-[#8683ba] text-center font-mono flex items-center justify-center gap-1 pt-1">
                  <ShieldCheck className="w-3 h-3 text-[#1a998d]" />
                  LiveKit Data Channel Active
                </p>
              </div>
            </aside>

            {/* Draggable Resizer Bar between Video and Editor */}
            <div
              onMouseDown={startResizing}
              className="hidden md:flex items-center justify-center w-2.5 hover:w-3 bg-[#070235] hover:bg-[#2170e4]/40 border-x border-[#444173] cursor-col-resize select-none transition-all group z-30 shrink-0"
              title="Drag horizontally to resize code editor"
            >
              <div className="w-1 h-10 bg-[#444173] group-hover:bg-[#89f5e7] rounded-full transition-colors flex items-center justify-center">
                <GripVertical className="w-2.5 h-2.5 text-[#8683ba] group-hover:text-white" />
              </div>
            </div>

            {/* Right Main Area: AI Coding Panel */}
            <div className={`flex-1 flex flex-col min-w-0 bg-[#0f172a] overflow-hidden ${
              mobileTab === "editor" ? "flex" : "hidden md:flex"
            }`}>
              <AiCodingPanel
                sessionId={sessionId}
                questionText={questionText}
                code={code}
                onChange={handleCodeChange}
                language={language}
                onLanguageChange={handleLanguageChange}
                isSyncing={isSyncing}
                onRunResult={handleCodeRunResult}
              />
            </div>

          </div>
        ) : (
          /* View Mode 2: Center Video Stage when coding panel is closed */
          <div className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="w-full max-w-4xl bg-[#1e1b4b] border border-[#444173] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
              
              {/* Error Banner */}
              {errorMessage && (
                <div className="p-4 bg-[#ffdad6] text-[#93000a] text-xs font-medium rounded-xl border border-[#ba1a1a]/20 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold">Device / Connection Error</p>
                    <p className="mt-0.5 text-[11px]">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Standalone Video Grid */}
              {renderVideoStage(false)}

              {/* Disconnected State Notice */}
              {connectionState === "DISCONNECTED" && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center text-xs text-amber-200 flex flex-col items-center gap-1.5">
                  <span className="font-bold text-sm text-amber-300">🎙️ Interview session has ended</span>
                  <span>The AI interviewer has closed the session. Redirecting you to your dashboard in a moment...</span>
                </div>
              )}

              {/* Standalone Controls Bar with Open Editor Option */}
              <div className="space-y-3">
                {renderControls(false)}

                <div className="flex items-center justify-center pt-2">
                  <button
                    onClick={() => setShowCodingPanel(true)}
                    className="px-4 py-2 bg-[#2170e4]/15 hover:bg-[#2170e4]/30 text-[#89f5e7] border border-[#2170e4]/40 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Open Code Editor & Scratchpad</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#8683ba] text-center font-mono flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1a998d]" />
                Encrypted Realtime Video & Audio Stream via LiveKit
              </p>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
