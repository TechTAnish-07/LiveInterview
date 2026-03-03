import { useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import api from "../Axios";

const WS_URL = "http://localhost:8080/ws";

export function useLiveInterviewStomp({ interviewId, token }) {
  const clientRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const readyRef = useRef(false);
  const questionTimerRef = useRef(null);
  const codeTimerRef = useRef(null);
  
  const [stompClientState, setStompClientState] = useState(null);
  const [question, setQuestion] = useState("");
  const [code, setCode] = useState("");
  const [connected, setConnected] = useState(false);
  const [output, setOutput] = useState("");
  const [interviewEnded, setInterviewEnded] = useState(false);
  
  const [securityFlags, setSecurityFlags] = useState([]);

  useEffect(() => {
    if (!interviewId) return;

    const loadInitialState = async () => {
      try {
        const res = await api.get(`/api/coding/interview/${interviewId}/state`);

        setQuestion(res.data.question || "");
        setCode(res.data.code || "");
        setOutput(res.data.output || "");
        setTimeout(() => {}, 0);
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

      // Subscribe to question updates
      client.subscribe(
        `/topic/interview/${interviewId}/question`,
        (message) => {
          const parsed = JSON.parse(message.body);
          isRemoteUpdate.current = true;
          setQuestion(parsed.question);
        }
      );

      // Subscribe to code execution output
      client.subscribe(
        `/topic/interview/${interviewId}/run-output`,
        (message) => {
          const parsed = JSON.parse(message.body);

          console.log("📩 Full message:", parsed);

          const text = parsed.payload || "";

          if (parsed.type === "STATUS") {
            setOutput(prev => prev + "\n" + text);
          }

          if (parsed.type === "STDOUT") {
            setOutput(prev => prev + text);
          }

          if (parsed.type === "ERROR") {
            setOutput(prev => prev + "\nError: " + text);
          }

          if (parsed.type === "COMPILE_ERROR") {
            setOutput(prev => prev + "\nCompile Error:\n" + text);
          }

          if (parsed.type === "DONE") {
            setOutput(prev => prev + "\n\nExecution Finished");
          }
        }
      );

    
      client.subscribe(
        `/topic/interview/${interviewId}/code`,
        (message) => {
          const parsed = JSON.parse(message.body);
          isRemoteUpdate.current = true;
          setCode(parsed.code);
        }
      );

     
      client.subscribe(
        `/topic/interview/${interviewId}/ended`,
        (message) => {
          console.log("Interview ended");
          setInterviewEnded(true);
        }
      );

     
      client.subscribe(
        `/topic/interview/${interviewId}/security`,
        (message) => {
          const flag = JSON.parse(message.body);
          console.log("🚩 Security flag received:", flag);
          
          setSecurityFlags((prev) => [
            ...prev,
            {
              ...flag,
              timestamp: new Date(flag.timestamp),
            },
          ]);
        }
      );

      readyRef.current = true;
      setConnected(true);
      setStompClientState(client);
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

  // 🚩 Send security flag (candidate sends to HR)
  const sendSecurityFlag = useCallback(
    (type, message, metadata = {}) => {
      if (!readyRef.current || !clientRef.current) {
        console.warn("Cannot send security flag: client not ready");
        return;
      }

      const destination = `/app/interview/${interviewId}/security`;
      console.log("🚩 Sending security flag to:", destination);

      try {
        const flag = {
          type,
          message,
          timestamp: new Date().toISOString(),
          metadata,
        };

        clientRef.current.publish({
          destination: destination,
          body: JSON.stringify(flag),
        });

        console.log("🚩 Security flag sent:", flag);
      } catch (e) {
        console.error("Error sending security flag:", e);
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
    // Existing returns
    connected,
    question,
    updateQuestion,
    code,
    updateCode,
    setOutput,
    output,
    stompClient: stompClientState,
    interviewEnded,
    securityFlags,
    sendSecurityFlag,
  };
}