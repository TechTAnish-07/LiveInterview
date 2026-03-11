import React, { lazy, use } from "react";
const History = lazy(()=> (import("./History"))) ;

const HRDashboard = () => {
  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        .dashboard-container {
          min-height: 100vh;
          padding: 50px 60px;
          font-family: 'Outfit', sans-serif;
           background: linear-gradient(180deg, rgb(96, 106, 142) 0%, #60698d 100%);
          color: #e2e8f0;
        }

        /* ================= HEADER ================= */

        .dashboard-header {
          margin-bottom: 40px;
        }

        .dashboard-title {
          font-size: 32px;
          font-weight: 700;
          color: #f8fafc;
        }

        .dashboard-subtext {
          margin-top: 8px;
          font-size: 15px;
          color: #94a3b8;
        }

        /* ================= STATS ================= */

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
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
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

        /* ================= SECTION ================= */

        .section-card {
          background: #1e293b;
          padding: 30px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 15px 35px rgba(0,0,0,0.5);
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #f1f5f9;
        }
      `}</style>

      <div className="dashboard-container">

        {/* HEADER */}
        <div className="dashboard-header">
          <div className="dashboard-title">HR Dashboard</div>
         
          <div className="dashboard-subtext">
            Manage interviews, track candidates, and monitor live sessions.
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">Total Interviews</div>
            <div className="stat-value"></div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Live Now</div>
            <div className="stat-value" style={{ color: "#ef4444" }}>
             
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Completed</div>
            <div className="stat-value" style={{ color: "#22c55e" }}>
            
            </div>
          </div>
        </div>

        {/* HISTORY SECTION */}
        <div className="section-card">
          <div className="section-title">Interview History</div>
          <History />
        </div>

      </div>
    </>
  );
};

export default HRDashboard;