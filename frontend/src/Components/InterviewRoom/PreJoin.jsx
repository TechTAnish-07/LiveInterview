import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, ArrowRight, ShieldCheck, Camera, Terminal, AlertCircle } from "lucide-react";

export default function PreJoin() {
  const { meetingLink } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [mediaReady, setMediaReady] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) {
      navigate(`/login?redirect=/join/${meetingLink}`, { replace: true });
      return;
    }
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
        setError("Could not access camera or microphone. Please enable permissions in your browser.");
      }
    };

    startPreview();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [token, meetingLink, navigate]);

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [camera]);

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

  const joinInterview = async () => {
    if (!token) return;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.warn("Fullscreen request failed:", err);
    }

    navigate(`/join/${meetingLink}`, {
      state: { mic, camera },
    });
  };

  return (
    <div className="min-h-screen bg-[#070235] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#d8e2ff]">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[300px] bg-[#2170e4]/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-lg bg-[#1e1b4b] border border-[#444173] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 text-center border-b border-[#444173] bg-[#070235]">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1e1b4b] border border-[#8683ba]/40 rounded-full text-[11px] font-mono text-[#89f5e7] mb-3">
            <Terminal className="w-3.5 h-3.5" />
            <span>LiveInterview Environment Check</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Pre-Session Readiness</h2>
          <p className="text-xs text-[#8683ba] mt-1">Verify your video and audio inputs before entering the interview room.</p>
        </div>

        <div className="p-6 space-y-5">
          
          {error && (
            <div className="p-3 bg-[#ffdad6] text-[#93000a] text-xs font-medium rounded-lg border border-[#ba1a1a]/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Camera Box */}
          <div className="relative aspect-video bg-[#0f172a] rounded-xl overflow-hidden border border-[#444173] shadow-inner flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover -scale-x-100 ${camera ? "block" : "hidden"}`}
            />

            {!camera && (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                <Camera className="w-10 h-10 text-slate-500" />
                <span className="text-xs font-mono">Camera Feed Disabled</span>
              </div>
            )}

            <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded text-[11px] font-mono flex items-center gap-1.5 border border-white/10">
              <span className={`w-2 h-2 rounded-full ${mic ? "bg-emerald-400" : "bg-red-400"}`}></span>
              <span>{mic ? "Audio Active" : "Muted"}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={toggleMic}
              className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                mic 
                  ? "bg-[#3b82f6]/20 border-[#3b82f6] text-white" 
                  : "bg-red-500/20 border-red-500 text-red-300"
              }`}
            >
              {mic ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
              <span>{mic ? "Mic On" : "Mic Muted"}</span>
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                camera 
                  ? "bg-[#3b82f6]/20 border-[#3b82f6] text-white" 
                  : "bg-red-500/20 border-red-500 text-red-300"
              }`}
            >
              {camera ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-red-400" />}
              <span>{camera ? "Camera On" : "Camera Off"}</span>
            </button>
          </div>

          {/* Enter Room Button */}
          <button
            onClick={joinInterview}
            disabled={!mediaReady && !error}
            className="w-full py-3.5 bg-[#2170e4] hover:bg-[#0058be] text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{mediaReady ? "Enter Interview Room" : "Initialising Hardware..."}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-[#8683ba] text-center font-mono flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1a998d]" />
            Session will open in proctored evaluation workspace
          </p>

        </div>

      </div>

    </div>
  );
}