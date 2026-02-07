import React from "react";
import { useParams } from "react-router-dom";
import { useLiveInterviewStomp } from "./useLiveInterviewStomp";
import TestEditor from "../TestEditor";

const LiveInterview = () => {
  const { id } = useParams();              
  const interviewId = Number(id);         
  const token = localStorage.getItem("accessToken");

  const {
    connected,
    question,
    updateQuestion,
    code,
    updateCode,
  } = useLiveInterviewStomp({
    interviewId,                         
    token,
  });

  if (!connected) {
    return <div>Connecting to interview...</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* QUESTION PANEL */}
      <div style={{ width: "35%", padding: "16px" }}>
        <h3>Question</h3>
        <textarea
          value={question}
          onChange={(e) => updateQuestion(e.target.value)}
          placeholder="Write interview question..."
          style={{ width: "100%", height: "90%" }}
        />
      </div>

      {/* CODE PANEL */}
      <div style={{ width: "65%" }}>
        <TestEditor value={code} onChange={updateCode} />
      </div>
    </div>
  );
};

export default LiveInterview;
