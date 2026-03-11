import React, { useState } from "react";
import { Link } from "react-router-dom";

const CandidateSchedule = ({ interviews = [] }) => {
  const [copiedId, setCopiedId] = useState(null);

  const now = new Date();

  const upcomingInterviews = Array.isArray(interviews)
    ? interviews.filter(
        (i) =>
          (i.status === "SCHEDULED" || i.status === "LIVE") &&
          new Date(i.endTime) >= now
      )
    : [];

  const getInterviewUrl = (meetingLink) =>
    `${window.location.origin}/prejoin/${meetingLink}`;

  const shareOnWhatsApp = (meetingLink) => {
    const interviewUrl = getInterviewUrl(meetingLink);
    const message = `Hi! You are invited to join the interview.\n\nJoin here 👉 ${interviewUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const copyLink = async (meetingLink, interviewId) => {
    const interviewUrl = getInterviewUrl(meetingLink);
    try {
      await navigator.clipboard.writeText(interviewUrl);
      setCopiedId(interviewId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert("Failed to copy link");
    }
  };

  return (
    <>
      <style>{`
        .interview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 28px;
        }

        .interview-card {
          background: #0f172a;
          border-radius: 18px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 15px 35px rgba(0,0,0,0.45);
          transition: all 0.25s ease;
        }

        .interview-card:hover {
          transform: translateY(-5px);
        }

        .email-text {
          font-weight: 600;
          font-size: 15px;
          color: #ffffff;
        }

        .sub-email {
          font-size: 13px;
          color: #94a3b8;
          margin-top: 4px;
        }

        .time-text {
          font-size: 13px;
          color: #94a3b8;
          margin: 12px 0;
          line-height: 1.5;
        }

        .status-badge {
          display: inline-block;
          padding: 5px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 14px;
        }

        .status-SCHEDULED {
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
        }

        .status-LIVE {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          animation: pulseLive 1.5s infinite;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          text-align: center;
          text-decoration: none;
        }

        .join-btn {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
        }

        .join-btn:hover { transform: translateY(-2px); }

        .share-btn, .copy-btn {
          background: #334155;
          color: #e2e8f0;
        }

        .share-btn:hover, .copy-btn:hover { background: #3f4f6b; }

        .empty-state {
          font-size: 14px;
          color: #94a3b8;
        }

        @keyframes pulseLive {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          70%  { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
      `}</style>

      {upcomingInterviews.length === 0 ? (
        <div className="empty-state">No upcoming interviews scheduled.</div>
      ) : (
        <div className="interview-grid">
          {upcomingInterviews.map((i) => (
            <div key={i.interviewId} className="interview-card">

              <div className="card-header">
                <div className="email-text">HR: {i.hrEmail}</div>
                <div className="sub-email">Candidate: {i.candidateEmail}</div>
              </div>

              <div className="time-text">
                🕒 {new Date(i.startTime).toLocaleString()}
                <br />→ {new Date(i.endTime).toLocaleString()}
              </div>

              <div className={`status-badge status-${i.status}`}>
                {i.status}
              </div>

              {i.meetingLink && (
                <div className="actions">
                  <Link to={`/prejoin/${i.meetingLink}`} className="btn join-btn">
                    Join Interview
                  </Link>
                  <button onClick={() => shareOnWhatsApp(i.meetingLink)} className="btn share-btn">
                    📲 WhatsApp
                  </button>
                  <button onClick={() => copyLink(i.meetingLink, i.interviewId)} className="btn copy-btn">
                    {copiedId === i.interviewId ? "Copied!" : "📋 Copy"}
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default CandidateSchedule;