import React, { useState } from 'react';
import CreateInterview from '../InterviewRoom/CreateInterview';
import api from '../Axios';

const InterviewSchedule = () => {
  const [showCreateInterview, setShowCreateInterview] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [interviewData, setInterviewData] = useState([]);
  try{
    const res  = api.get("/api/hr/schedule");
    setInterviewData(res.data);
  } catch (error) {
    console.error("Error fetching interview schedule:", error);
  }

  const handleInterviewCreated = (newInterview) => {
    setInterviews((prev) => [...prev, newInterview]);
    setShowCreateInterview(false);
  };

  return (
    <div>
      <h1>Interview Schedule</h1>

      {!showCreateInterview && (
        <button onClick={() => setShowCreateInterview(true)}>
          Create Interview
        </button>
      )}

      {showCreateInterview && (
        <CreateInterview
          onSuccess={handleInterviewCreated}
          onClose={() => setShowCreateInterview(false)}
        />
      )}

      {/* Interview list */}
      <ul>
        {interviews.map((i) => (
          <li key={i.interviewId}>
            {i.candidateEmail} — {i.status}
            {i.meetingLink && <a href={i.meetingLink}>Join Meeting</a>}
          </li>
        ))}
      </ul>
      
    </div>
  );
};

export default InterviewSchedule;
