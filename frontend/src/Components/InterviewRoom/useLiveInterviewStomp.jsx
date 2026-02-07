import { useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_URL = "http://localhost:8080/ws";

export function useLiveInterviewStomp({ interviewId, token }) {
  const clientRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const readyRef = useRef(false);
  const questionTimerRef = useRef(null);
  const codeTimerRef = useRef(null);

  const [question, setQuestion] = useState("");
  const [code, setCode] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
  if (!interviewId) return;

  const loadInitialState = async () => {
    try {
      const res = await api.get(`/api/interview/${interviewId}/state`);
      setQuestion(res.data.question || "");
      setCode(res.data.code || "");
    } catch (e) {
      console.error("Failed to load interview state", e);
    }
  };

  loadInitialState();
}, [interviewId]);

  useEffect(() => {
    if (!interviewId) {
      console.warn("STOMP not connected: interviewId missing");
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 3000,
      connectHeaders: token ? {
        Authorization: `Bearer ${token}`,
      } : {},
      debug: (str) => {
        // Uncomment for debugging
        // console.log('STOMP Debug:', str);
      },
    });

    client.onConnect = () => {
      console.log("✅ STOMP CONNECTED");

      client.subscribe(
        `/topic/interview/${interviewId}/question`,
        (message) => {
          const parsed = JSON.parse(message.body);
          isRemoteUpdate.current = true;
          setQuestion(parsed.question); // ✅ FIX
        }
      );


      client.subscribe(
        `/topic/interview/${interviewId}/code`,
        (message) => {
          const parsed = JSON.parse(message.body);
          isRemoteUpdate.current = true;
          setCode(parsed.code); // ✅ FIX
        }
      );

      readyRef.current = true;
      setConnected(true);
    };

    client.onStompError = (frame) => {
      console.error("[STOMP ERROR]", frame.headers["message"]);
      console.error("Error body:", frame.body);
      setConnected(false);
      readyRef.current = false;
    };

    client.onWebSocketError = (event) => {
      console.error("[WebSocket ERROR]", event);
    };

    client.onDisconnect = () => {
      console.log("🔌 STOMP DISCONNECTED");
      setConnected(false);
      readyRef.current = false;
    };

    client.activate();
    clientRef.current = client;

    return () => {
      console.log("🧹 Cleaning up STOMP connection");
      readyRef.current = false;
      setConnected(false);
      client.deactivate();
    };
  }, [interviewId, token]);

  /* ---------------- SENDERS ---------------- */

  const sendQuestionUpdate = useCallback(
    (value) => {
      if (!readyRef.current || !clientRef.current) {
        console.warn("Cannot send question: client not ready");
        return;
      }

      const destination = `/app/interview/${interviewId}/question`;
      console.log("📤 Sending question to:", destination);

      try {
        clientRef.current.publish({
          destination: destination,
          body: JSON.stringify({
            question: value,
            timestamp: Date.now(),
          }),
        });
      } catch (e) {
        console.error("Error sending question:", e);
      }
    },
    [interviewId]
  );

  const sendCodeUpdate = useCallback(
    (value) => {

      if (!readyRef.current || !clientRef.current) {
        console.warn("Cannot send code: client not ready");
        return;
      }

      const destination = `/app/interview/${interviewId}/code`;
      console.log("📤 Sending code to:", destination);

      try {
        console.log(value);
        clientRef.current.publish({
          destination: destination,
          body: JSON.stringify({
            code: value,
            language: "cpp",
            sender: "HR",
            timestamp: Date.now(),
          }),
        });
      } catch (e) {
        console.error("Error sending code:", e);
      }
    },
    [interviewId]
  );

  /* ---------------- SAFE STATE UPDATERS ---------------- */

 const updateQuestion = useCallback((value) => {
  setQuestion(value);

  if (isRemoteUpdate.current) {
    isRemoteUpdate.current = false;
    return;
  }

  clearTimeout(questionTimerRef.current);
  questionTimerRef.current = setTimeout(() => {
    sendQuestionUpdate(value);
  }, 400);
}, [sendQuestionUpdate]);

  const updateCode = useCallback((value) => {
    setCode(value);

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    clearTimeout(codeTimerRef.current);
    codeTimerRef.current = setTimeout(() => {
      sendCodeUpdate(value);
    }, 400);
  }, [sendCodeUpdate]);


  return {
    connected,
    question,
    updateQuestion,
    code,
    updateCode,
  };
}