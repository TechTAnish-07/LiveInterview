import React, { useEffect, useState } from "react";
import CandidateSchedule from "./CandidateSchedule";
import CandidateHistory from "./CandidateHistory";
import api from "../Axios";

const CandidateDashBoard = () => {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get("/api/interview/candidate/my-interviews");
        const data = Array.isArray(res.data) ? res.data : res.data.data ?? [];
        setInterviews(data);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      }
    };
    fetchInterviews();
  }, []);

  const now = new Date();
  const liveCount = interviews.filter((i) => i.status === "LIVE").length;
  const completedCount = interviews.filter((i) => i.status === "COMPLETED").length;
  const upcomingCount = interviews.filter(
    (i) => i.status === "SCHEDULED" && new Date(i.startTime) > now
  ).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        .candidate-dashboard {
          min-height: 100vh;
          padding: 50px 60px;
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(180deg, rgb(96, 106, 142) 0%, #60698d 100%);
          color: #e2e8f0;
        }

        .dashboard-header {
          margin-bottom: 40px;
        }

        .dashboard-title {
          font-size: 30px;
          font-weight: 700;
          color: #f8fafc;
        }

        .dashboard-subtext {
          margin-top: 8px;
          font-size: 15px;
          color: #94a3b8;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          margin-bottom: 50px;
        }

        .stat-card {
          background: #1e293b;
          padding: 22px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 12px 30px rgba(0,0,0,0.4);
          transition: 0.25s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-title {
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 26px;
          font-weight: 700;
          color: #ffffff;
        }

        .section-card {
          background: #1e293b;
          padding: 30px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 15px 35px rgba(0,0,0,0.5);
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #f1f5f9;
        }

        @media (max-width: 768px) {
          .candidate-dashboard {
            padding: 30px 20px;
          }
        }
      `}</style>

      <div className="candidate-dashboard">

        <div className="dashboard-header">
          <div className="dashboard-title">Candidate Dashboard</div>
          <div className="dashboard-subtext">
            Check your schedule, history, and manage your sessions.
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Upcoming</div>
            <div className="stat-value" style={{ color: "#38bdf8" }}>
              {upcomingCount}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Live Now</div>
            <div className="stat-value" style={{ color: "#ef4444" }}>
              {liveCount}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Completed</div>
            <div className="stat-value" style={{ color: "#22c55e" }}>
              {completedCount}
            </div>
          </div>
        </div>


        <div className="section-card">
          <div className="section-title">Interview History</div>
          <CandidateHistory />
        </div>

      </div>
    </>
  );
};

export default CandidateDashBoard;