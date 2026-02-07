import React from 'react'

const JoinInterview = ({ meetingLink }) => {
  return (
    <div>
        <button
      onClick={() => window.location.href = `/join/${meetingLink}`}
    >
      Join Interview
    </button>

    </div>
  );
}

export default JoinInterview
