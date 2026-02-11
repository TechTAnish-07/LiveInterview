import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PreJoin() {
  const { meetingLink } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
 
  // Start initial preview
  // useEffect(() => {
  //   const startPreview = async () => {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: true,
  //         audio: true
  //       });
        
  //       streamRef.current = stream;
        
  //       if (videoRef.current) {
  //         videoRef.current.srcObject = stream;
  //       }

  //       // Set initial states
  //       stream.getAudioTracks().forEach(track => {
  //         track.enabled = mic;
  //       });
  //       stream.getVideoTracks().forEach(track => {
  //         track.enabled = camera;
  //       });
  //     } catch (error) {
  //       console.error("Error accessing media devices:", error);
  //     }
  //   };

  //   startPreview();

  //   return () => {
  //     // Cleanup stream on unmount
  //     if (streamRef.current) {
  //       streamRef.current.getTracks().forEach(track => track.stop());
  //     }
  //   };
  // }, []);

  // Handle mic toggle - just enable/disable
  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !mic;
      });
      setMic(!mic);
    }
  };

 // Handle camera toggle - just enable/disable
  const toggleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !camera;
      });
      setCamera(!camera);
    }
  };

  const joinInterview = () => {
    // Stop preview stream before joining
    // if (streamRef.current) {
    //   streamRef.current.getTracks().forEach(track => track.stop());
    // }

    // Navigate with mic and camera preferences
    navigate(`/join/${meetingLink}`, {
      state: { mic, camera }
    });
  };

  return (
    <div style={{ 
      height: "100vh", 
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5"
    }}>
      <div style={{ 
        padding: "40px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        maxWidth: "600px",
        width: "100%"
      }}>
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
          Ready to Join?
        </h2>

        {/* Video Preview */}
        <div style={{ 
          position: "relative",
          marginBottom: "24px",
          backgroundColor: "#000",
          borderRadius: "8px",
          overflow: "hidden",
          height: "300px"
        }}>
          {camera ? (
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              playsInline
              style={{ 
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          ) : (
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1f1f1f",
              color: "white",
              gap: "10px"
            }}>
              <div style={{ fontSize: "48px" }}>👤</div>
              <div style={{ fontSize: "16px", opacity: 0.8 }}>Camera is off</div>
            </div>
          )}
          
          {/* Always render video element (hidden) to maintain stream */}
          {!camera && (
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              playsInline
              style={{ 
                display: "none"
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div style={{ 
          display: "flex", 
          gap: "12px",
          marginBottom: "24px",
          justifyContent: "center"
        }}>
          <button
            onClick={toggleMic}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: mic ? "#4CAF50" : "#f44336",
              color: "white",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {mic ? "🎤" : "🎤"} {mic ? "Mic On" : "Mic Off"}
          </button>

          <button
            onClick={toggleCamera}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: camera ? "#4CAF50" : "#f44336",
              color: "white",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {camera ? "📹" : "📹"} {camera ? "Camera On" : "Camera Off"}
          </button>
        </div>

        {/* Join Button */}
        <button 
          onClick={joinInterview}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#1a73e8",
            color: "white",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "16px"
          }}
        >
          Join Interview
        </button>
      </div>
    </div>
  );
}