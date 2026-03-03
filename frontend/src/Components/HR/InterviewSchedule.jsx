import React, { useEffect, useState } from "react";
import CreateInterview from "../InterviewRoom/CreateInterview";
import api from "../Axios";
import { Link } from "react-router-dom";

const InterviewSchedule = () => {
    const [showCreateInterview, setShowCreateInterview] = useState(false);
    const [interviews, setInterviews] = useState([]);
    const [copiedId, setCopiedId] = useState(null);
    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const res = await api.get("/api/hr/schedule");
                setInterviews(res.data);
            } catch (error) {
                console.error("Error fetching interview schedule:", error);
            }
        };

        fetchSchedule();
    }, []);

    const handleInterviewCreated = (newInterview) => {
        setInterviews((prev) => [...prev, newInterview]);

        setShowCreateInterview(false);

    };

    const now = new Date();

    const upcomingInterviews = interviews.filter((i) => {
        return (
            (i.status === "SCHEDULED" || i.status === "LIVE") &&
            new Date(i.endTime) >= now
        );
    });
    const getInterviewUrl = (meetingLink) => {
        return `${window.location.origin}/Prejoin/${meetingLink}`;
    };

    const shareOnWhatsApp = (meetingLink) => {
        const interviewUrl = getInterviewUrl(meetingLink);
        const message = `Hi! You are invited to join the interview.\n\nJoin here 👉 ${interviewUrl}`;
        const encodedMessage = encodeURIComponent(message);

        window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
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
        <> <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; }

  /* ========================= */
  /* CONTAINER */
  /* ========================= */

  .schedule-container {
    min-height: 100vh;
    padding: 50px 60px;
    font-family: 'Outfit', sans-serif;
      background: linear-gradient(180deg, rgb(96, 106, 142) 0%, #60698d 100%);
    color: #e2e8f0;
  }

  /* ========================= */
  /* HEADER */
  /* ========================= */

  .schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 50px;
  }

  .schedule-title {
    font-size: 30px;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: 0.5px;
  }

  .primary-btn {
    background: linear-gradient(135deg, #4f5bd5, #7b8cff);
    padding: 12px 24px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    color: white;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 8px 25px rgba(79, 91, 213, 0.4);
  }

  .primary-btn:hover {
    transform: translateY(-3px);
  }

  /* ========================= */
  /* GRID */
  /* ========================= */

  .interview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 28px;
  }

  /* ========================= */
  /* CARD */
  /* ========================= */

  .interview-card {
    background: #1e293b;
    border-radius: 18px;
    padding: 26px;
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 15px 35px rgba(0,0,0,0.4);
    transition: all 0.25s ease;
  }

  .interview-card:hover {
    transform: translateY(-6px);
  }

  .candidate-email {
    font-weight: 600;
    font-size: 16px;
    color: #ffffff;
    margin-bottom: 6px;
  }

  .time-text {
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 10px;
    line-height: 1.4;
  }

  /* ========================= */
  /* STATUS */
  /* ========================= */

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
    background: rgba(239, 68, 68, 0.18);
    color: #ef4444;
  }

  /* ========================= */
  /* ACTIONS */
  /* ========================= */

  .card-actions {
    display: flex;
    gap: 10px;
    margin-top: 12px;
  }

  .action-btn {
    flex: 1;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .join-btn {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
  }

  .join-btn:hover {
    transform: translateY(-2px);
  }

  .share-btn,
  .copy-btn {
    background: #334155;
    color: #e2e8f0;
  }

  .share-btn:hover,
  .copy-btn:hover {
    background: #3f4f6b;
  }

  /* ========================= */
  /* EMPTY STATE */
  /* ========================= */

  .empty-text {
    margin-top: 20px;
    font-size: 14px;
    color: #94a3b8;
  }

`}</style>
            <div className="schedule-container">
                <div className="schedule-header">
                    <div className="schedule-title">Interview Schedule</div>

                    {!showCreateInterview && (
                        <button
                            className="primary-btn"
                            onClick={() => setShowCreateInterview(true)}
                        >
                            Create Interview
                        </button>
                    )}
                </div>
                    {showCreateInterview && (
                        <CreateInterview
                            onSuccess={handleInterviewCreated}
                            onClose={() => setShowCreateInterview(false)}
                        />
                    )}
                



                <h2 style={{ marginBottom: "20px", fontWeight: "600" }}>
                    Upcoming Interviews
                </h2>

                {upcomingInterviews.length === 0 ? (
                    <div className="empty-text">No upcoming interviews scheduled.</div>
                ) : (
                    <div className="interview-grid">
                        {upcomingInterviews.map((i) => (
                            <div className="interview-card" key={i.interviewId}>

                                <div className="candidate-email">
                                    {i.candidateEmail}
                                </div>

                                <div className="time-text">
                                    🕒 {new Date(i.startTime).toLocaleString()}
                                    <br />
                                    → {new Date(i.endTime).toLocaleString()}
                                </div>

                                <div className={`status-badge status-${i.status}`}>
                                    {i.status}
                                </div>

                                {i.meetingLink && (
                                    <div className="card-actions">

                                        <Link
                                            to={`/prejoin/${i.meetingLink}`}
                                            className="action-btn join-btn"
                                        >
                                            Join
                                        </Link>

                                        <button
                                            onClick={() => shareOnWhatsApp(i.meetingLink)}
                                            className="action-btn share-btn"
                                        >
                                            📲 WhatsApp
                                        </button>

                                        <button
                                            onClick={() =>
                                                copyLink(i.meetingLink, i.interviewId)
                                            }
                                            className="action-btn copy-btn"
                                        >
                                            {copiedId === i.interviewId
                                                ? "Copied!"
                                                : "📋 Copy"}
                                        </button>

                                    </div>
                                )}

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default InterviewSchedule;
