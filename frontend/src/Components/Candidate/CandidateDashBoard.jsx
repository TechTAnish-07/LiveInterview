import React from 'react'
import CandidateSchedule from './CandidateSchedule'
import CandidateHistory from './CandidateHistory'

const CandidateDashBoard = () => {
  return (
    <div>
      <h2>Candidate Dashboard</h2>
      <p>Welcome to the Candidate Dashboard. Here you can view your interview schedule, history, and more.</p>
      <CandidateSchedule />
      <CandidateHistory />
    </div>
  )
}

export default CandidateDashBoard
