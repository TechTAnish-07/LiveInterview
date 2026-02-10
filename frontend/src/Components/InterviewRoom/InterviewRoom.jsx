import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useLiveInterviewStomp } from "./useLiveInterviewStomp";
import TestEditor from "../TestEditor";
import VideoCall from "./VideoCall";

const LiveInterview = () => {
  const { id } = useParams();              
  const interviewId = Number(id);         
  const token = localStorage.getItem("accessToken");
 const location = useLocation();

const mic = location.state?.mic ?? false;
const camera = location.state?.camera ?? false;
  const {
    connected,
    question,
    updateQuestion,
    code,
    updateCode,
    stompClient,
  } = useLiveInterviewStomp({
    interviewId,                         
    token,
  });

  if (!connected) {
    return <div>Connecting to interview...</div>;
  }

 return (
  <div style={{ display: "flex", height: "100vh", flexDirection: "column" }}>

    {/* MAIN INTERVIEW AREA */}
    <div style={{ display: "flex", flex: 1 }}>
      <div style={{ width: "35%", padding: "16px" }}>
        <h3>Question</h3>
        <textarea
          value={question}
          onChange={(e) => updateQuestion(e.target.value)}
          style={{ width: "100%", height: "90%" }}
        />
      </div>

      <div style={{ width: "65%" }}>
        <TestEditor value={code} onChange={updateCode} />
      </div>
    </div>

    {/* VIDEO CALL AREA */}
    <div style={{ height: "260px", borderTop: "1px solid #ccc" }}>
      <VideoCall stompClient={stompClient} interviewId={interviewId} mic={mic} camera={camera} />
    </div>
  </div>
);
};

export default LiveInterview;
