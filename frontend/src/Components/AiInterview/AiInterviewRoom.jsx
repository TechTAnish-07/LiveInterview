import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Room, RoomEvent, Track } from "livekit-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Bot, AlertCircle, Loader2, ShieldCheck, UserCheck, Activity, Camera } from "lucide-react";

export default function AiInterviewRoom() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = location.state || {};
  const { roomName, token, livekitUrl, jobRole } = stateData;

  const roomRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [connectionState, setConnectionState] = useState("INITIALIZING"); // INITIALIZING, CONNECTING, CONNECTED, DISCONNECTED, ERROR
  const [agentJoined, setAgentJoined] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

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
          console.log("Connected to LiveKit room:", room.name);
          setConnectionState("CONNECTED");

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
            setHasRemoteVideo(false);
          }
        });

        room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (!isMounted) return;
          if (track.kind === Track.Kind.Video && remoteVideoRef.current) {
            track.attach(remoteVideoRef.current);
            setHasRemoteVideo(true);
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track) => {
          if (track.kind === Track.Kind.Video) {
            track.detach();
            setHasRemoteVideo(false);
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
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
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
    if (roomRef.current) {
      roomRef.current.disconnect();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    navigate("/dashboard/candidate");
  };

  return (
    <div className="min-h-screen bg-[#070235] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#d8e2ff]">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[400px] bg-[#2170e4]/20 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-4xl bg-[#1e1b4b] border border-[#444173] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#444173] bg-[#070235] flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#1e1b4b] border border-[#8683ba]/40 rounded-full text-[11px] font-mono text-[#89f5e7] mb-1">
              <Bot className="w-3.5 h-3.5" />
              <span>Realtime AI Video & Audio Session</span>
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
                <span>{connectionState === "REQUESTING_PERMISSIONS" ? "Hardware Permissions..." : "Connecting..."}</span>
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
                <p className="font-bold">Device / Connection Error</p>
                <p className="mt-0.5 text-[11px]">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Video Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* AI Agent / Remote Stage */}
            <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#444173] shadow-inner relative overflow-hidden flex flex-col items-center justify-center min-h-[260px]">
              
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`absolute inset-0 w-full h-full object-cover ${hasRemoteVideo ? "block" : "hidden"}`}
              />

              {!hasRemoteVideo && (
                <div className="flex flex-col items-center justify-center text-center space-y-3 z-10">
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                      agentJoined 
                        ? "bg-gradient-to-tr from-[#0058be] to-[#89f5e7] text-[#070235] shadow-lg shadow-[#89f5e7]/20" 
                        : "bg-[#1e1b4b] text-[#8683ba] border border-[#444173]"
                    }`}>
                      <Bot className="w-10 h-10" />
                    </div>

                    {agentJoined && (
                      <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0f172a] flex items-center justify-center text-white" title="Agent Joined">
                        <UserCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">
                      {agentJoined ? "AI Interviewer Present" : connectionState === "CONNECTED" ? "Waiting for AI Agent..." : "Initializing Room..."}
                    </h3>
                    <p className="text-xs text-[#8683ba] max-w-xs">
                      {agentJoined 
                        ? "The AI agent is listening and ready for your responses." 
                        : "Connecting to LiveKit room..."}
                    </p>
                  </div>

                  {agentJoined && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#89f5e7] bg-[#89f5e7]/10 px-3 py-1 rounded-full border border-[#89f5e7]/20">
                      <Activity className="w-3.5 h-3.5 animate-pulse" />
                      <span>Audio Channel Active</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Candidate Local Video Camera Preview Stage */}
            <div className="bg-[#0f172a] rounded-2xl border border-[#444173] shadow-inner relative overflow-hidden flex items-center justify-center min-h-[260px]">
              
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover -scale-x-100 ${cameraEnabled ? "block" : "hidden"}`}
              />

              {!cameraEnabled && (
                <div className="flex flex-col items-center justify-center text-[#8683ba] gap-2 p-6 text-center">
                  <Camera className="w-10 h-10 text-[#444173]" />
                  <span className="text-xs font-mono">Candidate Camera Off</span>
                </div>
              )}

              <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[11px] font-mono flex items-center gap-1.5 border border-white/10">
                <span className={`w-2 h-2 rounded-full ${micEnabled ? "bg-emerald-400" : "bg-red-400"}`}></span>
                <span>{micEnabled ? "Mic Active" : "Muted"}</span>
              </div>
            </div>

          </div>

          {/* Disconnected State Notice */}
          {connectionState === "DISCONNECTED" && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center text-xs text-amber-200">
              The interview session has ended or the connection was closed.
            </div>
          )}

          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={toggleMic}
              disabled={connectionState !== "CONNECTED"}
              className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer disabled:opacity-40 ${
                micEnabled 
                  ? "bg-[#3b82f6]/20 border-[#3b82f6] text-white hover:bg-[#3b82f6]/30" 
                  : "bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30"
              }`}
            >
              {micEnabled ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
              <span>{micEnabled ? "Mic On" : "Mic Muted"}</span>
            </button>

            <button
              onClick={toggleCamera}
              disabled={connectionState !== "CONNECTED"}
              className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer disabled:opacity-40 ${
                cameraEnabled 
                  ? "bg-[#3b82f6]/20 border-[#3b82f6] text-white hover:bg-[#3b82f6]/30" 
                  : "bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30"
              }`}
            >
              {cameraEnabled ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-red-400" />}
              <span>{cameraEnabled ? "Camera On" : "Camera Off"}</span>
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
            Encrypted Realtime Video & Audio Stream via LiveKit
          </p>

        </div>

      </div>

    </div>
  );
}
