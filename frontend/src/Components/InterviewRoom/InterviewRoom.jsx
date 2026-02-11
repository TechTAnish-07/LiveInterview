import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useLiveInterviewStomp } from "./useLiveInterviewStomp";
import TestEditor from "../TestEditor";
import VideoCall from "./VideoCall";
import { useAuth } from "../AuthProvider";

const LiveInterview = () => {
  const { id } = useParams();     
  const {isHR } = useAuth();         
  const interviewId = Number(id);         
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  // Get mic and camera preferences from PreJoin
  const mic = location.state?.mic ?? true;  // Default to true if not provided
  const camera = location.state?.camera ?? true;

  // Get interview data (which includes userId)
  const interview = location.state?.interview;

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

  // Extract userId from interview data
  // Adjust this based on your actual data structure
  const userId = interview?.candidateId || interview?.userId || "user_" + Date.now();

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
    {/* <div cladsName ="viewResume" style={{ padding: "16px", borderTop: "1px solid #ccc" }}>
        <h3>Candidate Resume</h3>
        {interview?.resumeUrl ? (
          <iframe
            src={interview.resumeUrl}
            title="Candidate Resume"
            style={{ width: "100%", height: "400px", border: "none" }}
          />
        ) : (
          <p>No resume available</p>
        )}
    </div> */}
      {/* VIDEO CALL AREA */}
      {/* <div style={{ height: "260px", borderTop: "1px solid #ccc" }}>
        <VideoCall
          stompClient={stompClient}
          interviewId={interviewId}
          userId={userId}
          mic={mic}
          camera={camera}
          isHost={isHR}
        />
      </div> */}
  
    </div>
  );
};

export default LiveInterview;