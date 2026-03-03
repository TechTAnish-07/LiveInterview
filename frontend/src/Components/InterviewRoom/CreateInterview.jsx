import React, { useState } from "react";
import api from "../Axios";

const CreateInterview = ({ onSuccess, onClose }) => {
  const [candidateEmail, setCandidateEmail] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewStartTime, setInterviewStartTime] = useState("");
  const [interviewEndTime, setInterviewEndTime] = useState("");
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      const res = await api.post("/api/hr/createInterview", payload);
      onSuccess(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(66, 83, 119, 0.75); /* No blur */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  }

  .modal-card {
    width: 420px;
    background:rgb(85, 105, 149); /* Solid background */
    border-radius: 20px;
    padding: 36px;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 25px 70px rgba(0,0,0,0.6);
    animation: slideUp 0.3s ease;
    font-family: 'Outfit', sans-serif;
    color: #e2e8f0;
  }

  .modal-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 24px;
    color: #f8fafc;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 18px;
  }

  .form-label {
    font-size: 13px;
    color: #94a3b8;
  }

  .form-input {
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    background: #1f2937; /* Solid input background */
    color: #e2e8f0;
    font-size: 14px;
    outline: none;
    transition: 0.2s ease;
  }

  .form-input:focus {
    border: 1px solidrgb(7, 15, 108);
  }

  .time-row {
    display: flex;
    gap: 12px;
  }

  .btn-row {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
  }

  .primary-btn {
    flex: 1;
    background: linear-gradient(135deg,rgb(0, 0, 0),rgb(4, 6, 36));
    border: none;
    padding: 12px;
    border-radius: 10px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: 0.25s ease;
    margin-right: 8px;
  }

  .primary-btn:hover {
    transform: translateY(-2px);
  }

  .secondary-btn {
    flex: 1;
    background: #1f2937;
    border: 1px solid rgba(255,255,255,0.08);
    padding: 12px;
    border-radius: 10px;
    font-weight: 600;
    color: #e2e8f0;
    cursor: pointer;
    transition: 0.25s ease;
    margin-left: 8px;
  }

  .secondary-btn:hover {
    background: #273449;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`}</style>
       
      <div className="modal-overlay">
        <div className="modal-card">
          <div className="modal-title">Create Interview</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Candidate Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="candidate@example.com"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Interview Date</label>
              <input
                type="date"
                className="form-input"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time Slot</label>
              <div className="time-row">
                <input
                  type="time"
                  className="form-input"
                  value={interviewStartTime}
                  onChange={(e) => setInterviewStartTime(e.target.value)}
                  required
                />
                <input
                  type="time"
                  className="form-input"
                  value={interviewEndTime}
                  onChange={(e) => setInterviewEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="btn-row">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateInterview;