import { useEffect, useRef } from "react";
import { useWebRTC } from "./useWebRTC";

export default function VideoCall({ stompClient, interviewId, userId, mic, camera }) {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const subscriptionRef = useRef(null);
  const initializedRef = useRef(false);

  const {
    createPeerConnection,
    startMedia,
    createOffer,
    handleSignal,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    cleanup,
    localStream,
    remoteStream,
    isMicOn,
    isCameraOn,
    isScreenSharing
  } = useWebRTC(stompClient, interviewId, userId);

  // Single initialization effect
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initialize = async () => {
      // 1. Create peer connection
      createPeerConnection();

      // 2. Subscribe to WebRTC signaling
      subscriptionRef.current = stompClient.subscribe(
        `/topic/room/${interviewId}`,
        msg => handleSignal(JSON.parse(msg.body))
      );

      // 3. Start media with PreJoin settings and create offer
      try {
        await startMedia({ mic, camera });
        await createOffer();
      } catch (error) {
        console.error("Failed to start media:", error);
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      subscriptionRef.current?.unsubscribe();
      cleanup();
      initializedRef.current = false;
    };
  }, []);

  // Update video elements when streams change
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Video Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "10px",
        maxWidth: "1200px"
      }}>
        <div style={{ position: "relative" }}>
          {isCameraOn || isScreenSharing ? (
            <video 
              ref={localVideo} 
              autoPlay 
              muted 
              playsInline 
              style={{ 
                width: "100%", 
                backgroundColor: "#000",
                borderRadius: "8px"
              }}
            />
          ) : (
            <div style={{
              width: "100%",
              height: "400px",
              backgroundColor: "#1f1f1f",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "48px"
            }}>
              📹
            </div>
          )}
          <div style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            color: "white",
            background: "rgba(0,0,0,0.5)",
            padding: "5px 10px",
            borderRadius: "4px"
          }}>
            You {isScreenSharing && "(Sharing Screen)"}
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <video 
            ref={remoteVideo} 
            autoPlay 
            playsInline 
            style={{ 
              width: "100%", 
              backgroundColor: "#000",
              borderRadius: "8px"
            }}
          />
          <div style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            color: "white",
            background: "rgba(0,0,0,0.5)",
            padding: "5px 10px",
            borderRadius: "4px"
          }}>
            Remote User
          </div>
        </div>
      </div>

      {/* Controls - Google Meet Style */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        justifyContent: "center",
        padding: "20px"
      }}>
        <button 
          onClick={toggleMic}
          style={{
            padding: "15px 30px",
            borderRadius: "50px",
            border: "none",
            backgroundColor: isMicOn ? "#fff" : "#ea4335",
            color: isMicOn ? "#000" : "#fff",
            cursor: "pointer",
            fontWeight: "500",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        >
          {isMicOn ? "🎤 Mic On" : "🎤 Mic Off"}
        </button>

        <button 
          onClick={toggleCamera}
          style={{
            padding: "15px 30px",
            borderRadius: "50px",
            border: "none",
            backgroundColor: isCameraOn ? "#fff" : "#ea4335",
            color: isCameraOn ? "#000" : "#fff",
            cursor: "pointer",
            fontWeight: "500",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        >
          {isCameraOn ? "📹 Camera On" : "📹 Camera Off"}
        </button>

        <button 
          onClick={toggleScreenShare}
          style={{
            padding: "15px 30px",
            borderRadius: "50px",
            border: "none",
            backgroundColor: isScreenSharing ? "#1a73e8" : "#fff",
            color: isScreenSharing ? "#fff" : "#000",
            cursor: "pointer",
            fontWeight: "500",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        >
          {isScreenSharing ? "🖥️ Stop Sharing" : "🖥️ Share Screen"}
        </button>
      </div>
    </div>
  );
}