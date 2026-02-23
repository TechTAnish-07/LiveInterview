import { useRef, useState, useCallback } from "react";

export function useWebRTC(stompClient, interviewId, userId, isHost) {
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const callStartedRef = useRef(false);
  const iceCandidateQueue = useRef([]); // ✅ ICE queue fix

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);       // ✅ NEW
  const [cameraEnabled, setCameraEnabled] = useState(true);  // ✅ NEW
  const [connectionState, setConnectionState] = useState("idle");

  const createPeerConnection = useCallback(() => {
    if (pcRef.current && pcRef.current.signalingState !== "closed") {
      return pcRef.current;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.relay.metered.ca:80" },
        {
          urls: "turn:global.relay.metered.ca:80",
          username: "fd4f52a0cee0c0a019b418ad",
          credential: "VQj44UKCQIEqvAcE",
        },
        {
          urls: "turn:global.relay.metered.ca:80?transport=tcp",
          username: "fd4f52a0cee0c0a019b418ad",
          credential: "VQj44UKCQIEqvAcE",
        },
        {
          urls: "turn:global.relay.metered.ca:443",
          username: "fd4f52a0cee0c0a019b418ad",
          credential: "VQj44UKCQIEqvAcE",
        },
        {
          urls: "turns:global.relay.metered.ca:443?transport=tcp",
          username: "fd4f52a0cee0c0a019b418ad",
          credential: "VQj44UKCQIEqvAcE",
        },
      ],
    });

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && stompClient?.connected) {
        stompClient.publish({
          destination: `/app/signal/${interviewId}`,
          body: JSON.stringify({
            type: "CANDIDATE",
            from: userId,
            payload: event.candidate,
          }),
        });
      }
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
      if (pc.connectionState === "failed") {
        console.error("WebRTC connection failed");
      }
    };

    pcRef.current = pc;
    return pc;
  }, [stompClient, interviewId, userId]);

  // -----------------------
  // Start Media
  // -----------------------
  const startMedia = async ({ mic = true, camera = true } = {}) => {
    if (localStreamRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      stream.getAudioTracks().forEach((t) => (t.enabled = mic));
      stream.getVideoTracks().forEach((t) => (t.enabled = camera));

      localStreamRef.current = stream;
      setLocalStream(stream);
      setMicEnabled(mic);
      setCameraEnabled(camera);

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    } catch (err) {
      console.error("Failed to access media devices:", err);
    }
  };

  // -----------------------
  // ✅ Toggle Mic
  // -----------------------
  const toggleMic = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setMicEnabled((prev) => !prev);
  }, []);

  // -----------------------
  // ✅ Toggle Camera
  // -----------------------
  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setCameraEnabled((prev) => !prev);
  }, []);

  // -----------------------
  // Create Offer (HOST = HR)
  // -----------------------
  const createOffer = async () => {
    if (!isHost || callStartedRef.current) return;

    try {
      if (!localStreamRef.current) await startMedia();

      const pc = createPeerConnection();
      callStartedRef.current = true;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      stompClient.publish({
      destination: `/app/signal/${interviewId}`,
        body: JSON.stringify({
          type: "OFFER",
          from: userId,
          payload: offer,
        }),
      });
    } catch (err) {
      console.error("Create offer error:", err);
      callStartedRef.current = false;
    }
  };

  // -----------------------
  // ✅ Flush ICE Queue
  // -----------------------
  const flushIceCandidateQueue = async (pc) => {
    while (iceCandidateQueue.current.length > 0) {
      const candidate = iceCandidateQueue.current.shift();
      try {
        await pc.addIceCandidate(candidate);
      } catch (err) {
        console.error("Failed to add queued ICE candidate:", err);
      }
    }
  };

  // -----------------------
  // Handle Signaling
  // -----------------------
  const handleSignal = async (signal) => {
    
     console.log(`🔍 Filter check — signal.from: "${signal.from}" | myUserId: "${userId}" | skip: ${signal.from === userId}`);
  if (signal.from === userId) return;

    const pc = createPeerConnection();

    try {
      if (signal.type === "OFFER") {
        // ✅ Candidate: start media if not yet started
        if (!localStreamRef.current) {
          await startMedia();
        }

        await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
        await flushIceCandidateQueue(pc); // ✅ drain queue

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        stompClient.publish({
          destination: `/app/signal/${interviewId}`,
          body: JSON.stringify({
            type: "ANSWER",
            from: userId,
            payload: answer,
          }),
        });
      }

      if (signal.type === "ANSWER") {
        if (pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
          await flushIceCandidateQueue(pc); // ✅ drain queue
        }
      }

      if (signal.type === "CANDIDATE") {
        // ✅ Queue if remote description not set yet
        if (pc.remoteDescription?.type) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.payload));
        } else {
          iceCandidateQueue.current.push(new RTCIceCandidate(signal.payload));
        }
      }
    } catch (err) {
      console.error("Signal handling error:", err);
    }
  };

  // -----------------------
  // Cleanup
  // -----------------------
  const cleanup = useCallback(() => {
    callStartedRef.current = false;
    iceCandidateQueue.current = [];

    if (pcRef.current && pcRef.current.signalingState !== "closed") {
      pcRef.current.close();
    }
    pcRef.current = null;

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;

    setLocalStream(null);
    setRemoteStream(null);
    setMicEnabled(true);
    setCameraEnabled(true);
    setConnectionState("idle");
  }, []);

  return {
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
  };
}