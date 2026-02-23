import { useEffect, useRef, useCallback } from "react";
import { useWebRTC } from "./useWebRTC";

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
    if (initializedRef.current) return; // ✅ block double init
    initializedRef.current = true;

    const initialize = async () => {
      console.log("VideoCall initializing — isHost:", isHost, "userId:", userId);

      createPeerConnection();

      subscriptionRef.current = stompClient.subscribe(
        `/topic/interview/${interviewId}`,
        (msg) => {
          const signal = JSON.parse(msg.body);
          console.log("📨 Signal received:", signal.type, "from:", signal.from, "| myId:", userId);
          handleSignalRef.current?.(signal);
        }
      );

      await startMedia({ mic, camera });

      if (isHost) {
        console.log("✅ HR sending offer in 1s...");
        setTimeout(() => createOffer(), 1000);
      }
    };

    initialize();

    return () => {
      initializedRef.current = false; // ✅ reset on unmount
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0f172a" }}>
      <div style={{ display: "flex", flex: 1, gap: "8px", padding: "8px" }}>

        {/* Remote video */}
        <div style={{
          flex: 1, position: "relative", background: "#1e293b",
          borderRadius: "10px", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {remoteStream ? (
            <video ref={remoteVideo} autoPlay playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ color: "#94a3b8", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: 8 }}>
                {isHost ? "🧑‍💻" : "👔"}
              </div>
              Waiting for {isHost ? "Candidate" : "HR"}...
            </div>
          )}
          <span style={{
            position: "absolute", bottom: 6, left: 8, color: "#fff",
            fontSize: "11px", background: "rgba(0,0,0,0.6)",
            padding: "2px 8px", borderRadius: 4,
          }}>
            {isHost ? "Candidate" : "HR"}
          </span>
        </div>

        {/* Local video */}
        <div style={{
          width: "140px", flexShrink: 0, position: "relative",
          background: "#1e293b", borderRadius: "10px", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid #3b82f6",
        }}>
          {cameraEnabled ? (
            <video ref={localVideo} autoPlay muted playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
          ) : (
            <div style={{ color: "#94a3b8", fontSize: 12, textAlign: "center" }}>
              <div style={{ fontSize: 28 }}>🚫</div>
              Camera off
            </div>
          )}
          <span style={{
            position: "absolute", bottom: 4, left: 6, color: "#fff",
            fontSize: "10px", background: "rgba(0,0,0,0.6)",
            padding: "1px 6px", borderRadius: 3,
          }}>You</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        gap: "12px", padding: "8px", borderTop: "1px solid #1e293b",
      }}>
        <span style={{
          alignSelf: "center", fontSize: 11, marginRight: "auto", paddingLeft: 8,
          color: connectionState === "connected" ? "#22c55e"
            : connectionState === "connecting" ? "#f59e0b" : "#94a3b8",
        }}>
          {connectionState === "connected" ? "● Connected"
            : connectionState === "connecting" ? "● Connecting..."
            : "● Waiting"}
        </span>

        <button onClick={toggleMic} style={{
          width: 40, height: 40, borderRadius: "50%", border: "none",
          background: micEnabled ? "#334155" : "#ef4444",
          color: "white", cursor: "pointer", fontSize: 16,
        }}>
          {micEnabled ? "🎙" : "🔇"}
        </button>

        <button onClick={toggleCamera} style={{
          width: 40, height: 40, borderRadius: "50%", border: "none",
          background: cameraEnabled ? "#334155" : "#ef4444",
          color: "white", cursor: "pointer", fontSize: 16,
        }}>
          {cameraEnabled ? "📷" : "🚫"}
        </button>
      </div>
    </div>
  );
}