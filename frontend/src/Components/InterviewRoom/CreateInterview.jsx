import React, { useState } from 'react';
import api from '../Axios';

const CreateInterview = ({ onSuccess, onClose }) => {
  const [candidateEmail, setCandidateEmail] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewStartTime, setInterviewStartTime] = useState('');
  const [interviewEndTime, setInterviewEndTime] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();

    const startTime = `${interviewDate}T${interviewStartTime}:00`;
    const endTime = `${interviewDate}T${interviewEndTime}:00`;

    const payload = {
      candidateEmail,
      startTime,
      endTime,
    };

    try {
      const res = await api.post('/api/hr/createInterview', payload);
      onSuccess(res.data); 
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div>
      <h1>Create Interview</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Candidate Email"
          value={candidateEmail}
          onChange={(e) => setCandidateEmail(e.target.value)}
          required
        />

        <input
          type="date"
          value={interviewDate}
          onChange={(e) => setInterviewDate(e.target.value)}
          required
        />

        <input
          type="time"
          value={interviewStartTime}
          onChange={(e) => setInterviewStartTime(e.target.value)}
          required
        />

        <input
          type="time"
          value={interviewEndTime}
          onChange={(e) => setInterviewEndTime(e.target.value)}
          required
        />

        <button type="submit">Create</button>

        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateInterview;
