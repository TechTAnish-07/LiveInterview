import React, { useState } from 'react';
import CreateInterview from '../InterviewRoom/CreateInterview';

const InterviewSchedule = () => {
  const [showCreateInterview, setShowCreateInterview] = useState(false);
  const [interviews, setInterviews] = useState([]);

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
