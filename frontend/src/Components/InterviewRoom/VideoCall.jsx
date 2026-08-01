import React, { useEffect, useRef } from "react";
import { useWebRTC } from "./useWebRTC";
import { Mic, MicOff, Video, VideoOff, User, Wifi } from "lucide-react";

export default function VideoCall({
  stompClient,
  interviewId,
  userId,
  mic,
  camera,
  isHost,
}) {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const subscriptionRef = useRef(null);
  const handleSignalRef = useRef(null);
  const initializedRef = useRef(false);

  const {
    createPeerConnection,
    startMedia,
    createOffer,
    handleSignal,
    cleanup,
    toggleMic,
    toggleCamera,
    localStream,
    remoteStream,
    micEnabled,
    cameraEnabled,
    connectionState,
  } = useWebRTC(stompClient, interviewId, userId, isHost);

  useEffect(() => {
    handleSignalRef.current = handleSignal;
  }, [handleSignal]);

  useEffect(() => {
    if (!stompClient?.connected) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initialize = async () => {
      createPeerConnection();

      subscriptionRef.current = stompClient.subscribe(
        `/topic/interview/${interviewId}`,
        (msg) => {
          const signal = JSON.parse(msg.body);
          handleSignalRef.current?.(signal);
        }
      );

      await startMedia({ mic, camera });

      if (isHost) {
        setTimeout(() => createOffer(), 1000);
      }
    };

    initialize();

    return () => {
      initializedRef.current = false;
      subscriptionRef.current?.unsubscribe();
      cleanup();
    };
  }, [stompClient]);

  useEffect(() => {
    if (localStream && localVideo.current) {
      localVideo.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideo.current) {
      remoteVideo.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex flex-col h-full bg-[#070235] text-white p-3 space-y-3">
      
      {/* Remote Video Tile */}
      <div className="relative flex-1 rounded-xl overflow-hidden bg-[#1e1b4b] border border-[#444173] shadow-md flex items-center justify-center min-h-[160px]">
        {remoteStream ? (
          <video
            ref={remoteVideo}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#8683ba] text-xs gap-2">
            <User className="w-10 h-10 text-[#444173]" />
            <span className="font-mono">Waiting for {isHost ? "Candidate" : "HR Recruiter"}...</span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded text-[11px] font-mono text-white flex items-center gap-1.5 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-[#1a998d]"></span>
          <span>{isHost ? "Candidate" : "HR Recruiter"}</span>
        </div>
      </div>

      {/* Local Video Tile */}
      <div className="relative h-32 rounded-xl overflow-hidden bg-[#1e1b4b] border-2 border-[#0058be] ring-2 ring-[#0058be]/20 shadow-md flex items-center justify-center">
        {cameraEnabled ? (
          <video
            ref={localVideo}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover -scale-x-100"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#8683ba] text-xs gap-1">
            <VideoOff className="w-6 h-6 text-red-400" />
            <span className="font-mono text-[10px]">Camera Muted</span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-mono text-white border border-white/10">
          You ({isHost ? "HR" : "Candidate"})
        </div>
      </div>

      {/* Connection & Media Controls Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1e1b4b]">
        
        {/* Status indicator */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <Wifi className={`w-3.5 h-3.5 ${
            connectionState === "connected" ? "text-emerald-400" : "text-amber-400"
          }`} />
          <span className={
            connectionState === "connected" ? "text-emerald-400 font-semibold" : "text-amber-400"
          }>
            {connectionState === "connected" ? "WebRTC Connected" : "Connecting..."}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMic}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              micEnabled 
                ? "bg-[#1e1b4b] text-white hover:bg-[#444173]" 
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
            title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleCamera}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              cameraEnabled 
                ? "bg-[#1e1b4b] text-white hover:bg-[#444173]" 
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
            title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
          >
            {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>
        </div>

      </div>

    </div>
  );
}