import { useEffect, useRef } from "react";
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

  const {
    createPeerConnection,
    startMedia,
    createOffer,
    handleSignal,
    cleanup,
    localStream,
    remoteStream,
  } = useWebRTC(stompClient, interviewId, userId, isHost);

  useEffect(() => {
    const initialize = async () => {
      createPeerConnection();

      subscriptionRef.current = stompClient.subscribe(
        `/topic/room/${interviewId}`,
        (msg) => handleSignal(JSON.parse(msg.body))
      );

      await startMedia({ mic, camera });

      if (isHost) {
        await createOffer();
      }
    };

    initialize();

    return () => {
      subscriptionRef.current?.unsubscribe();
      cleanup();
    };
  }, []);

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
    <div style={{ display: "flex", gap: "10px" }}>
      <video ref={localVideo} autoPlay muted playsInline />
      <video ref={remoteVideo} autoPlay playsInline />
    </div>
  );
}
