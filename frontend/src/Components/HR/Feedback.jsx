import React, { useState } from "react";
import api from "../Axios";
import { useNavigate, useParams } from "react-router-dom";

const Feedback = () => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [decision, setDecision] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { interviewId } = useParams();
  const navigate = useNavigate();
  
  const submitFeedback = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        interviewId,
        feedback,
        rating,
        decision,
      };

      const res = await api.post("/api/feedback/interview", payload);
    
      setFeedback("");
      setRating(0);
      setDecision("");
      setSuccess(true);
      
      // Auto-navigate after 2 seconds
      setTimeout(() => {
        navigate(`/dashboard/HR`);
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .feedback-container {
          display: flex;
          justify-content: center;
          padding: 40px;
          font-family: 'Outfit', sans-serif;
        }

        .feedback-card {
          width: 100%;
          max-width: 500px;
          background: #111827;
          border-radius: 16px;
          padding: 28px;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }

        .feedback-title {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #f1f5f9;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 18px;
        }

        .label {
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 6px;
        }

        .input,
        .select,
        .textarea {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 10px;
          color: #e2e8f0;
          font-size: 14px;
          outline: none;
        }

        .textarea {
          resize: none;
          min-height: 100px;
        }

        .stars {
          display: flex;
          gap: 6px;
          font-size: 22px;
          cursor: pointer;
        }

        .star {
          color: #334155;
          transition: 0.2s;
        }

        .star.active {
          color: #facc15;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg,#4f5bd5,#6366f1);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: 0.25s;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success-message {
          text-align: center;
          padding: 40px 20px;
        }

        .success-icon {
          font-size: 48px;
          color: #10b981;
          margin-bottom: 16px;
          animation: scaleIn 0.5s ease-out;
        }

        .success-text {
          font-size: 20px;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 8px;
        }

        .success-subtext {
          font-size: 14px;
          color: #94a3b8;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      <div className="feedback-container">
        <div className="feedback-card">
          {success ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <div className="success-text">Feedback Submitted!</div>
              <div className="success-subtext">Redirecting to dashboard...</div>
            </div>
          ) : (
            <>
              <div className="feedback-title">Interview Feedback</div>

              <form onSubmit={submitFeedback}>
                
                {/* Rating */}
                <div className="form-group">
                  <label className="label">Rating</label>

                  <div className="stars">
                    {[1,2,3,4,5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= rating ? "active" : ""}`}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {/* Decision */}
                <div className="form-group">
                  <label className="label">Decision</label>

                  <select
                    className="select"
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    required
                  >
                    <option value="">Select Decision</option>
                    <option value="SELECTED">Selected</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>

                {/* Feedback */}
                <div className="form-group">
                  <label className="label">Feedback</label>

                  <textarea
                    className="textarea"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write interview feedback..."
                    required
                  />
                </div>

                {/* Submit */}
                <button
                  className="submit-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Feedback"}
                </button>

              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Feedback;