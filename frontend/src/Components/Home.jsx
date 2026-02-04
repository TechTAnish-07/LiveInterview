import React from 'react'
import TestEditor from './TestEditor.jsx'
import InterviewRoom from './InterviewRoom/InterviewRoom.jsx'

const Home = () => {
  return (
    <div>
      <h1>Welcome to LiveInterview</h1>
      <p>Your one-stop solution for all interview preparations.</p>

  <InterviewRoom />
    </div>
  )
}

export default Home
