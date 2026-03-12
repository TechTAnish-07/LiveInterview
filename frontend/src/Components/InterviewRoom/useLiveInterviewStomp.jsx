import { useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import api from "../Axios";

const WS_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080/ws"
    : "https://liveintervieww.tech/ws";

export function useLiveInterviewStomp({ interviewId, token, role }) {
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
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [securityFlags, setSecurityFlags] = useState([]);

  useEffect(() => {
    if (!interviewId) return;

    const loadInitialState = async () => {
      try {
        const res = await api.get(`/api/coding/interview/${interviewId}/state`);
        setQuestion(res.data.question || "");
        setCode(res.data.code || "");
        setOutput(res.data.output || "");
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
        interviewId: String(interviewId),
        role: role,
      } : {},
      debug: (str) => {
     //   console.log('STOMP Debug:', str); // Enable for debugging
      },
    });

    // ✅ SINGLE onConnect handler
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

      // Subscribe to code updates
      client.subscribe(
        `/topic/interview/${interviewId}/code`,
        (message) => {
          const parsed = JSON.parse(message.body);
          isRemoteUpdate.current = true;
          setCode(parsed.code);
        }
      );

      // Subscribe to interview end
      client.subscribe(
        `/topic/interview/${interviewId}/ended`,
        (message) => {
          console.log("Interview ended");
          setInterviewEnded(true);
        }
      );

      // Subscribe to security flags
      client.subscribe(
        `/topic/interview/${interviewId}/security`,
        (message) => {
          const flag = JSON.parse(message.body);
        //  console.log("🚩 Security flag received:", flag);
          
          setSecurityFlags((prev) => [
            ...prev,
            {
              ...flag,
              timestamp: new Date(flag.timestamp),
            },
          ]);
        }
      );

      // ✅ Subscribe to presence broadcasts
      client.subscribe(
        `/topic/interview/${interviewId}/presence`,
        (message) => {
          const data = JSON.parse(message.body);
       //   console.log("👤 Presence broadcast:", data);
          
          setOnlineUsers((prevUsers) => {
            const updated = new Map(prevUsers);
            
            if (data.status === "JOINED") {
       //       console.log(`✅ User JOINED: ${data.user} (${data.role})`);
              updated.set(data.user, {
                role: data.role,
                status: data.status,
                joinedAt: new Date()
              });
            } else if (data.status === "LEFT") {
      //        console.log(`👋 User LEFT: ${data.user}`);
              updated.delete(data.user);
            }
            
        //    console.log(`📊 Total online: ${updated.size}`);
            return updated;
          });
        }
      );

      // ✅ Subscribe to personal presence snapshot
      client.subscribe(
        `/user/queue/presence/snapshot`,
        (message) => {
          const users = JSON.parse(message.body);
       //   console.log("📋 Received user snapshot:", users);
          
          setOnlineUsers((prevUsers) => {
            const updated = new Map();
            users.forEach(presence => {
              if (presence.status === "JOINED") {
                updated.set(presence.user, {
                  role: presence.role,
                  status: presence.status,
                  joinedAt: new Date()
                });
              }
            });
         //   console.log(`📊 Snapshot loaded: ${updated.size} users`);
            return updated;
          });
        }
      );

      // ✅ Send join message AFTER subscriptions
    //  console.log("📤 Sending presence join...");
      client.publish({
        destination: `/app/interview/${interviewId}/presence/join`,
        body: JSON.stringify({ action: "join" })
      });

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
      setOnlineUsers(new Map()); // Clear users on disconnect
    };

    client.activate();
    clientRef.current = client;

    return () => {
      console.log("🧹 Cleaning up STOMP connection");
      readyRef.current = false;
      setConnected(false);
      setOnlineUsers(new Map());
      client.deactivate();
    };
  }, [interviewId, token, role]);

  /* ---------------- SENDERS ---------------- */

  const sendQuestionUpdate = useCallback(
    (value) => {
      if (!readyRef.current || !clientRef.current) {
        console.warn("Cannot send question: client not ready");
        return;
      }

      const destination = `/app/interview/${interviewId}/question`;
      
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
      
      try {
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

  const sendSecurityFlag = useCallback(
    (type, message, metadata = {}) => {
      if (!readyRef.current || !clientRef.current) {
        console.warn("Cannot send security flag: client not ready");
        return;
      }

      const destination = `/app/interview/${interviewId}/security`;
      
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
    onlineUsers,
  };
}