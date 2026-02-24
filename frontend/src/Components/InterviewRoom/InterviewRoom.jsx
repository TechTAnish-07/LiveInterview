import React, { useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useLiveInterviewStomp } from "./useLiveInterviewStomp";
import VideoCall from "./VideoCall";
import { useAuth } from "../AuthProvider";
import Compiler from "./Compiler";

const LiveInterview = () => {
  const { id } = useParams();
  const { isHR, user } = useAuth();
 
  const interviewId = Number(id);
  const token = localStorage.getItem("accessToken");
  const location = useLocation();
   const userId = user?.email || user?.username;   
 
  const mic = location.state?.mic ?? true;
  const camera = location.state?.camera ?? true;

  const interview = location.state?.interview;

  const {
    connected,
    question,
    updateQuestion,
    code,
    updateCode,
    stompClient,
    output,
    setOutput,

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

     
       {/* Divider */}
        <div style={{ width: "65%" }}>
          <Compiler
          value={code}
          onChange={(value) => updateCode(value)}
         
          output={output}
          clearOutput={() => setOutput("")}
          interviewId={interviewId}
         />
        </div>
      </div>
    
     
      {/* Add this right before the VideoCall render: */}
      {console.log("LiveInterview render — isHR:", isHR, "userId:", userId, "stompClient:", !!stompClient)}
      <div
        
      >
          {stompClient && (
            <VideoCall
              stompClient={stompClient}
              interviewId={interviewId}
              userId={String(userId)}
              mic={mic}
              camera={camera}
              isHost={isHR} // ✅ HR creates the offer
            />
          )}
        
      </div>
    </div>
  );
};

export default LiveInterview;