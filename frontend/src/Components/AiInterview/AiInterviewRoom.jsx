import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Room, RoomEvent } from "livekit-client";
import { Mic, MicOff, PhoneOff, Bot, AlertCircle, Loader2, ShieldCheck, UserCheck, Activity } from "lucide-react";

export default function AiInterviewRoom() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = location.state || {};
  const { roomName, token, livekitUrl, jobRole } = stateData;

  const roomRef = useRef(null);
  const audioStreamRef = useRef(null);

  const [connectionState, setConnectionState] = useState("INITIALIZING"); // INITIALIZING, CONNECTING, CONNECTED, DISCONNECTED, ERROR
  const [agentJoined, setAgentJoined] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Redirect if route state is missing
  useEffect(() => {
    if (!token || !livekitUrl || !roomName) {
      console.warn("Missing LiveKit connection parameters. Redirecting to entry page.");
      navigate("/ai-interview", { replace: true });
    }
  }, [token, livekitUrl, roomName, navigate]);

  // Main LiveKit & Audio Permission Lifecycle
  useEffect(() => {
    if (!token || !livekitUrl) return;

    let isMounted = true;
    const room = new Room();
    roomRef.current = room;

    const initAndConnect = async () => {
      try {
        // 1. Request microphone permission
        setConnectionState("REQUESTING_PERMISSIONS");
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = mediaStream;

        if (!isMounted) return;

        // 2. Setup LiveKit Event Listeners
        room.on(RoomEvent.Connected, () => {
          if (!isMounted) return;
          console.log("Connected to LiveKit room:", room.name);
          setConnectionState("CONNECTED");

          // Check if agent participant is already present
          if (room.remoteParticipants.size > 0) {
            setAgentJoined(true);
          }
        });

        room.on(RoomEvent.Disconnected, (reason) => {
          if (!isMounted) return;
          console.log("Disconnected from LiveKit room. Reason:", reason);
          setConnectionState("DISCONNECTED");
          setAgentJoined(false);
        });

        room.on(RoomEvent.ParticipantConnected, (participant) => {
          if (!isMounted) return;
          console.log("Participant connected:", participant.identity);
          setAgentJoined(true);
        });

        room.on(RoomEvent.ParticipantDisconnected, (participant) => {
          if (!isMounted) return;
          console.log("Participant disconnected:", participant.identity);
          if (room.remoteParticipants.size === 0) {
            setAgentJoined(false);
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

        // 4. Enable local microphone track
        await room.localParticipant.setMicrophoneEnabled(true);
        setMicEnabled(true);

      } catch (err) {
        console.error("LiveKit room initialization error:", err);
        if (!isMounted) return;

        setConnectionState("ERROR");
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMessage("Microphone permission was denied. Please allow microphone access in your browser to participate.");
        } else {
          setErrorMessage(err.message || "Failed to connect to AI interview room.");
        }
      }
    };

    initAndConnect();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, [token, livekitUrl]);

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

  const handleLeaveInterview = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    navigate("/dashboard/candidate");
  };

  return (
    <div className="min-h-screen bg-[#070235] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#d8e2ff]">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[300px] bg-[#2170e4]/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-xl bg-[#1e1b4b] border border-[#444173] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#444173] bg-[#070235] flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#1e1b4b] border border-[#8683ba]/40 rounded-full text-[11px] font-mono text-[#89f5e7] mb-1">
              <Bot className="w-3.5 h-3.5" />
              <span>Voice AI Workspace</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {jobRole || "AI Technical Interview"}
            </h2>
            <p className="text-xs text-[#8683ba] font-mono mt-0.5">Room: {roomName || "Session"}</p>
          </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2">
            {connectionState === "CONNECTED" && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Connected</span>
              </span>
            )}
            {(connectionState === "CONNECTING" || connectionState === "REQUESTING_PERMISSIONS") && (
              <span className="px-3 py-1 bg-[#0058be]/20 text-[#89f5e7] border border-[#0058be]/40 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{connectionState === "REQUESTING_PERMISSIONS" ? "Mic Permission..." : "Connecting..."}</span>
              </span>
            )}
            {connectionState === "DISCONNECTED" && (
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono font-bold">
                Disconnected
              </span>
            )}
            {connectionState === "ERROR" && (
              <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full text-xs font-mono font-bold">
                Error
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-[#ffdad6] text-[#93000a] text-xs font-medium rounded-xl border border-[#ba1a1a]/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">Connection / Hardware Error</p>
                <p className="mt-0.5 text-[11px]">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Agent Presence & Audio Visualizer Box */}
          <div className="bg-[#0f172a] rounded-2xl p-8 border border-[#444173] text-center shadow-inner relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
            
            {/* Agent Status Icon & Visual Pulse */}
            <div className="relative mb-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                agentJoined 
                  ? "bg-gradient-to-tr from-[#0058be] to-[#89f5e7] text-[#070235] shadow-lg shadow-[#89f5e7]/20" 
                  : "bg-[#1e1b4b] text-[#8683ba] border border-[#444173]"
              }`}>
                <Bot className="w-10 h-10" />
              </div>

              {agentJoined && (
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0f172a] flex items-center justify-center text-white" title="Interviewer Active">
                  <UserCheck className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {/* Agent Status Text */}
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {agentJoined ? "AI Interviewer Joined" : connectionState === "CONNECTED" ? "Waiting for Interviewer..." : "Initializing Room..."}
              </h3>
              <p className="text-xs text-[#8683ba] max-w-sm">
                {agentJoined 
                  ? "The AI agent is ready and listening in the room. Speak into your microphone to conduct the interview." 
                  : connectionState === "CONNECTED"
                  ? "Connected to LiveKit hub. The agent worker will automatically join your room in a moment."
                  : "Establishing secure audio connection..."}
              </p>
            </div>

            {agentJoined && (
              <div className="mt-4 flex items-center gap-1 text-[11px] font-mono text-[#89f5e7] bg-[#89f5e7]/10 px-3 py-1 rounded-full border border-[#89f5e7]/20">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>Audio Channel Active</span>
              </div>
            )}
          </div>

          {/* Disconnected State Notice */}
          {connectionState === "DISCONNECTED" && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center text-xs text-amber-200">
              The interview session has ended or the connection was closed.
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              onClick={toggleMic}
              disabled={connectionState !== "CONNECTED"}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer disabled:opacity-40 ${
                micEnabled 
                  ? "bg-[#3b82f6]/20 border-[#3b82f6] text-white hover:bg-[#3b82f6]/30" 
                  : "bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30"
              }`}
            >
              {micEnabled ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
              <span>{micEnabled ? "Microphone On" : "Microphone Muted"}</span>
            </button>

            <button
              onClick={handleLeaveInterview}
              className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave Interview</span>
            </button>
          </div>

          <p className="text-[11px] text-[#8683ba] text-center font-mono flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1a998d]" />
            Encrypted WebRTC Realtime Voice Transport
          </p>

        </div>

      </div>

    </div>
  );
}
