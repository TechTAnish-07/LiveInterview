import React from "react";

const Practice = () => {
  return (
    <>
      <style>{`
        .practice-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(135deg, rgb(96, 106, 142) 0%, #60698d 100%);
          color: #e2e8f0;
          text-align: center;
          padding: 40px;
        }

        .badge {
          background: rgba(99, 102, 241, 0.15);
          color:rgb(34, 46, 160);
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 20px;
          letter-spacing: 1px;
        }

        .title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .subtitle {
          font-size: 15px;
          color:rgb(26, 62, 113);
          margin-bottom: 30px;
          max-width: 500px;
        }

        .loader {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .dots::after {
          content: '';
          animation: dots 1.5s infinite;
        }

        @keyframes dots {
          0% { content: ''; }
          33% { content: '.'; }
          66% { content: '..'; }
          100% { content: '...'; }
        }

        .footer-note {
          margin-top: 20px;
          font-size: 13px;
          color:rgb(233, 112, 13);
        }
      `}</style>

      <div className="practice-container">
        <div className="badge">🚧 FEATURE IN PROGRESS</div>

        <div className="title">
          Practice Module <span className="dots"></span>
        </div>

        <div className="subtitle">
          We're building an interactive coding practice environment
          with real-time feedback, test cases, and analytics.
        </div>

        <div className="loader"></div>

        <div className="footer-note">
          Stay tuned — something awesome is coming soon ⚡
        </div>
      </div>
    </>
  );
};

export default Practice;