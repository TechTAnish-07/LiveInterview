import { useRef, useState } from "react";

export function useWebRTC(stompClient, interviewId, userId, isHost) {
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const callStartedRef = useRef(false);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // -----------------------
  // Create PeerConnection
  // -----------------------
  const createPeerConnection = () => {
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
      if (event.candidate) {
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

    pcRef.current = pc;
    return pc;
  };

  // -----------------------
  // Start Media
  // -----------------------
  const startMedia = async ({ mic = true, camera = true } = {}) => {
    if (localStreamRef.current) return;

    const pc = createPeerConnection();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    stream.getAudioTracks().forEach((track) => {
      track.enabled = mic;
    });

    stream.getVideoTracks().forEach((track) => {
      track.enabled = camera;
    });

    localStreamRef.current = stream;
    setLocalStream(stream);

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });
  };

  // -----------------------
  // Create Offer (HOST ONLY)
  // -----------------------
  const createOffer = async () => {
    if (!isHost) return;
    if (callStartedRef.current) return;

    const pc = createPeerConnection();

    if (!localStreamRef.current) {
      await startMedia();
    }

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
  };

  // -----------------------
  // Handle Signaling
  // -----------------------
  const handleSignal = async (signal) => {
    const pc = createPeerConnection();
    if (signal.from === userId) return;

    if (signal.type === "OFFER") {
      await pc.setRemoteDescription(signal.payload);

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
      await pc.setRemoteDescription(signal.payload);
    }

    if (signal.type === "CANDIDATE") {
      await pc.addIceCandidate(signal.payload);
    }
  };

  // -----------------------
  // Cleanup
  // -----------------------
  const cleanup = () => {
    callStartedRef.current = false;

    if (pcRef.current && pcRef.current.signalingState !== "closed") {
      pcRef.current.close();
    }

    pcRef.current = null;

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
  };

  return {
    createPeerConnection,
    startMedia,
    createOffer,
    handleSignal,
    cleanup,
    localStream,
    remoteStream,
  };
}
