import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PreJoin() {
  const { meetingLink } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [mediaReady, setMediaReady] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Start preview on mount
  useEffect(() => {
    const startPreview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;
        setMediaReady(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setError("Could not access camera/microphone. Please check permissions.");
      }
    };

    startPreview();

    // ✅ Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // ✅ Attach stream to video when ref is ready
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [camera]); // re-attach when camera toggles back on

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !mic;
      });
      setMic((prev) => !prev);
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !camera;
      });
      setCamera((prev) => !prev);
    }
  };

  const joinInterview = () => {
    // ✅ Stop preview tracks — VideoCall will request its own stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    navigate(`/join/${meetingLink}`, {
      state: { mic, camera },
    });
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
      }}
    >
      <div
        style={{
          padding: "40px",
          backgroundColor: "#1e293b",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          maxWidth: "500px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#f1f5f9", margin: 0 }}>
          Ready to Join?
        </h2>

        {error && (
          <div
            style={{
              background: "#450a0a",
              color: "#fca5a5",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* ✅ Camera Preview */}
        <div
          style={{
            position: "relative",
            backgroundColor: "#0f172a",
            borderRadius: "12px",
            overflow: "hidden",
            height: "280px",
            border: "1px solid #334155",
          }}
        >
          {/* Always render video, just hide when camera is off */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
              display: camera ? "block" : "none",
            }}
          />

          {/* Camera off overlay */}
          {!camera && (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                gap: "10px",
                position: "absolute",
                top: 0,
                left: 0,
                background: "#0f172a",
              }}
            >
              <div style={{ fontSize: "52px" }}>👤</div>
              <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                Camera is off
              </div>
            </div>
          )}

          {/* Mic status indicator */}
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              background: "rgba(0,0,0,0.6)",
              borderRadius: "6px",
              padding: "4px 10px",
              color: mic ? "#22c55e" : "#ef4444",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {mic ? "🎙 Mic On" : "🔇 Mic Off"}
          </div>
        </div>

        {/* Toggle Controls */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={toggleMic}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: mic ? "#22c55e" : "#ef4444",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            {mic ? "🎤 Mic On" : "🔇 Mic Off"}
          </button>

          <button
            onClick={toggleCamera}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: camera ? "#22c55e" : "#ef4444",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            {camera ? "📷 Cam On" : "🚫 Cam Off"}
          </button>
        </div>

        {/* Join Button */}
        <button
          onClick={joinInterview}
          disabled={!mediaReady && !error}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: mediaReady || error ? "#3b82f6" : "#1e40af",
            color: "white",
            cursor: mediaReady || error ? "pointer" : "not-allowed",
            fontWeight: "700",
            fontSize: "16px",
            opacity: mediaReady || error ? 1 : 0.6,
          }}
        >
          {mediaReady ? "Join Interview" : "Setting up devices..."}
        </button>
      </div>
    </div>
  );
}