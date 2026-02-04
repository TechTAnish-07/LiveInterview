import { useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_URL = "http://localhost:8080/ws";

export function useLiveInterviewStomp({ interviewId }) {
  const clientRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  const [question, setQuestion] = useState("");
  const [code, setCode] = useState("");
  const [connected, setConnected] = useState(false);

  /* ---------------- CONNECT & SUBSCRIBE ---------------- */
  useEffect(() => {
    if (!interviewId) {
      console.warn("STOMP not connected: interviewId missing");
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 3000,
      debug: () => {},
    });

    client.onConnect = () => {
      setConnected(true);

      // ✅ QUESTION SUBSCRIPTION
      client.subscribe(
        `/topic/interview.${interviewId}.question`,
        (message) => {
          isRemoteUpdate.current = true;
          setQuestion(JSON.parse(message.body).value);
        }
      );

      // ✅ CODE SUBSCRIPTION
      client.subscribe(
        `/topic/interview.${interviewId}.code`,
        (message) => {
          isRemoteUpdate.current = true;
          setCode(JSON.parse(message.body).value);
        }
      );
    };

    client.onStompError = (frame) => {
      console.error("[STOMP ERROR]", frame.headers["message"]);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setConnected(false);
    };
  }, [interviewId]);

  /* ---------------- SENDERS ---------------- */

  const sendQuestionUpdate = useCallback(
    (value) => {
      if (!clientRef.current || !connected) return;

      clientRef.current.publish({
        destination: `/app/interview/${interviewId}/question`,
        body: JSON.stringify({ value }),
      });
    },
    [connected, interviewId]
  );

  const sendCodeUpdate = useCallback(
    (value) => {
      if (!clientRef.current || !connected) return;

      clientRef.current.publish({
        destination: `/app/interview/${interviewId}/code`,
        body: JSON.stringify({ value }),
      });
    },
    [connected, interviewId]
  );

  /* ---------------- SAFE STATE UPDATERS ---------------- */

  const updateQuestion = (value) => {
    setQuestion(value);
    if (!isRemoteUpdate.current) {
      sendQuestionUpdate(value);
    }
    isRemoteUpdate.current = false;
  };

  const updateCode = (value) => {
    setCode(value);
    if (!isRemoteUpdate.current) {
      sendCodeUpdate(value);
    }
    isRemoteUpdate.current = false;
  };

  return {
    connected,
    question,
    updateQuestion,
    code,
    updateCode,
  };
}
