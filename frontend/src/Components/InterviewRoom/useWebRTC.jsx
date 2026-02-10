import { useRef, useState } from "react";

export function useWebRTC(stompClient, interviewId, userId) {
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const callStartedRef = useRef(false);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // 1️⃣ Safe PeerConnection creation
  const createPeerConnection = () => {
    if (pcRef.current) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    const remote = new MediaStream();
    setRemoteStream(remote);

    pc.ontrack = e => {
      e.streams[0].getTracks().forEach(track =>
        remote.addTrack(track)
      );
    };

    pc.onicecandidate = e => {
      if (e.candidate) {
        stompClient.publish({
          destination: `/app/signal/${interviewId}`,
          body: JSON.stringify({
            type: "CANDIDATE",
            from: userId,
            payload: e.candidate
          })
        });
      }
    };

    pcRef.current = pc;
  };

  // 2️⃣ Start media with initial mic/camera settings
  const startMedia = async ({ mic = true, camera = true } = {}) => {
    if (localStreamRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      // Set initial states based on PreJoin settings
      stream.getAudioTracks().forEach(track => {
        track.enabled = mic;
      });
      stream.getVideoTracks().forEach(track => {
        track.enabled = camera;
      });

      setIsMicOn(mic);
      setIsCameraOn(camera);

      // Add tracks to peer connection
      stream.getTracks().forEach(track =>
        pcRef.current.addTrack(track, stream)
      );
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  };

  // 3️⃣ Create offer ONCE
  const createOffer = async () => {
    if (callStartedRef.current) return;

    callStartedRef.current = true;

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    stompClient.publish({
      destination: `/app/signal/${interviewId}`,
      body: JSON.stringify({
        type: "OFFER",
        from: userId,
        payload: offer
      })
    });
  };

  // 4️⃣ Handle signaling safely
  const handleSignal = async signal => {
    if (!pcRef.current) return;
    if (signal.from === userId) return; // 🔑 ignore self

    if (signal.type === "OFFER") {
      callStartedRef.current = true;

      await pcRef.current.setRemoteDescription(signal.payload);
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      stompClient.publish({
        destination: `/app/signal/${interviewId}`,
        body: JSON.stringify({
          type: "ANSWER",
          from: userId,
          payload: answer
        })
      });
    }

    if (signal.type === "ANSWER") {
      await pcRef.current.setRemoteDescription(signal.payload);
    }

    if (signal.type === "CANDIDATE") {
      await pcRef.current.addIceCandidate(signal.payload);
    }
  };

  // 5️⃣ Controls - Google Meet style
  const toggleMic = () => {
    const audioTracks = localStreamRef.current?.getAudioTracks();
    if (audioTracks && audioTracks.length > 0) {
      const newState = !audioTracks[0].enabled;
      audioTracks.forEach(track => {
        track.enabled = newState;
      });
      setIsMicOn(newState);
    }
  };

  const toggleCamera = async () => {
    const videoTracks = localStreamRef.current?.getVideoTracks();
    if (!videoTracks || videoTracks.length === 0) return;

    if (isCameraOn) {
      // Turn OFF: Stop the track completely (turns off camera light)
      videoTracks.forEach(track => track.stop());
      
      // Remove video track from stream
      videoTracks.forEach(track => {
        localStreamRef.current.removeTrack(track);
      });

      // Replace with null track in peer connection
      const sender = pcRef.current
        ?.getSenders()
        .find(s => s.track?.kind === "video");
      
      if (sender) {
        sender.replaceTrack(null);
      }

      setIsCameraOn(false);
    } else {
      // Turn ON: Request new video track
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });

        const newVideoTrack = newStream.getVideoTracks()[0];
        
        // Add to local stream
        localStreamRef.current.addTrack(newVideoTrack);

        // Replace track in peer connection
        const sender = pcRef.current
          ?.getSenders()
          .find(s => s.track === null || s.track?.kind === "video");
        
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }

        setIsCameraOn(true);
        
        // Update local stream state to trigger re-render
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
      } catch (error) {
        console.error("Error restarting camera:", error);
      }
    }
  };

  // 6️⃣ Screen share - Google Meet style toggle
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true 
      });

      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace video track in peer connection
      const sender = pcRef.current
        .getSenders()
        .find(s => s.track?.kind === "video");

      if (sender) {
        await sender.replaceTrack(screenTrack);
      }

      setIsScreenSharing(true);

      // Auto-stop when user stops sharing
      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error("Error starting screen share:", error);
    }
  };

  const stopScreenShare = () => {
    // Stop screen stream
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }

    // Replace with camera track
    const camTrack = localStreamRef.current?.getVideoTracks()[0];
    const sender = pcRef.current
      ?.getSenders()
      .find(s => s.track?.kind === "video");

    if (sender && camTrack) {
      sender.replaceTrack(camTrack);
    }

    setIsScreenSharing(false);
  };

  // 7️⃣ Cleanup
  const cleanup = () => {
    callStartedRef.current = false;

    pcRef.current?.close();
    pcRef.current = null;

    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    
    localStreamRef.current = null;
    screenStreamRef.current = null;
  };

  return {
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
  };
}