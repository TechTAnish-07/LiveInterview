import React, { useEffect, useState } from "react";
import api from "../Axios";

const CandidateHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortOrder, setSortOrder] = useState("newest"); 
  const [statusPriority, setStatusPriority] = useState("none");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get(
          "/api/interview/candidate/my-interviews"
        );
        setInterviews(res.data);
      } catch (error) {
        console.error("Error fetching interview schedule:", error);
      }
    };

    fetchSchedule();
  }, []);

  const now = new Date();

  /* ========================= */
  /* FILTER HISTORY */
  /* ========================= */

  let historyInterviews = interviews.filter(
    (i) =>
      (i.status === "EXPIRED" &&
        new Date(i.endTime) <= now) ||
      i.status === "COMPLETED"
  );

  const fetchFeedback = async (interviewId) => {
    try {
      const res = await api.get(`/api/feedback/interview/${interviewId}`);
     // console.log("Feedback for interview", interviewId, res.data);
      setSelectedFeedback(res.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      alert("No feedback found for this interview");
      return null;
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFeedback(null);
  };

  /* ========================= */
  /* STATUS PRIORITY SORT */
  /* ========================= */

  if (statusPriority === "completedFirst") {
    historyInterviews.sort((a, b) =>
      a.status === "COMPLETED" ? -1 : 1
    );
  }

  if (statusPriority === "expiredFirst") {
    historyInterviews.sort((a, b) =>
      a.status === "EXPIRED" ? -1 : 1
    );
  }

  /* ========================= */
  /* TIME SORT */
  /* ========================= */

  historyInterviews.sort((a, b) => {
    const dateA = new Date(a.startTime);
    const dateB = new Date(b.startTime);

    return sortOrder === "newest"
      ? dateB - dateA
      : dateA - dateB;
  });

  /* ========================= */
  /* PAGINATION */
  /* ========================= */

  const totalPages = Math.ceil(
    historyInterviews.length / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = historyInterviews.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <>
      <style>{`
        .history-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #f1f5f9;
        }

        .history-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .filter-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .select {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.08);
          color: #e2e8f0;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
        }

        .history-card {
          background: #111827;
          border-radius: 14px;
          padding: 16px 20px;
          border: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          transition: 0.25s ease;
        }

        .history-card:hover {
          transform: translateY(-3px);
          background: #1a2338;
        }

        .status-badge {
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
        }

        .status-COMPLETED {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .status-EXPIRED {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .pagination {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .page-btn {
          padding: 6px 12px;
          border-radius: 8px;
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.08);
          color: #e2e8f0;
          cursor: pointer;
        }

        .page-btn.active {
          background: #4f5bd5;
          color: white;
          border: none;
        }

        .view-btn {
          padding: 6px 12px;
          border-radius: 8px;
          background: linear-gradient(135deg, #4f5bd5, #6366f1);
          border: none;
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: 0.2s;
        }

        .view-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(79, 91, 213, 0.4);
        }

        /* MODAL STYLES */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: #111827;
          border-radius: 16px;
          padding: 28px;
          width: 90%;
          max-width: 550px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: slideUp 0.3s ease-out;
          max-height: 90vh;
          overflow-y: auto;
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .modal-title {
          font-size: 20px;
          font-weight: 600;
          color: #f1f5f9;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 24px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: 0.2s;
        }

        .close-btn:hover {
          background: rgba(255,255,255,0.05);
          color: #f1f5f9;
        }

        .feedback-section {
          margin-bottom: 20px;
        }

        .feedback-label {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .feedback-value {
          color: #e2e8f0;
          font-size: 14px;
          line-height: 1.6;
        }

        .rating-stars {
          display: flex;
          gap: 6px;
          font-size: 24px;
        }

        .star-filled {
          color: #facc15;
        }

        .star-empty {
          color: #334155;
        }

        .decision-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
        }

        .decision-SELECTED {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .decision-REJECTED {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .decision-ON_HOLD {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
        }

        .feedback-text {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 14px;
          color: #e2e8f0;
          line-height: 1.7;
          font-size: 14px;
        }
      `}</style>

      <div>
        <div className="history-title">Interview History</div>

        {/* FILTER BAR */}
        <div className="history-topbar">
          <div className="filter-group">
            <select
              className="select"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <select
              className="select"
              value={itemsPerPage}
              onChange={handlePageSizeChange}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={15}>15 per page</option>
            </select>
          </div>
        </div>

        {paginatedData.map((i) => (
          <div key={i.interviewId} className="history-card">
            <div>
              <div style={{ fontWeight: 600 }}>
                HR: {i.hrEmail}
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                {new Date(i.startTime).toLocaleString()} →{" "}
                {new Date(i.endTime).toLocaleString()}
              </div>
            </div>

            <div className={`status-badge status-${i.status}`}>
              {i.status}
            </div>
            <div style={{ marginLeft: "20px" }}>
              <button
                className="view-btn"
                onClick={() => fetchFeedback(i.interviewId)}
              >
                View Feedback
              </button>
            </div>
          </div>
        ))}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`page-btn ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}

        {/* FEEDBACK MODAL */}
        {showModal && selectedFeedback && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Interview Feedback</div>
                <button className="close-btn" onClick={closeModal}>
                  ×
                </button>
              </div>

              {/* Rating */}
              <div className="feedback-section">
                <div className="feedback-label">Rating</div>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= selectedFeedback.rating
                          ? "star-filled"
                          : "star-empty"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {/* Decision */}
              <div className="feedback-section">
                <div className="feedback-label">Decision</div>
                <span
                  className={`decision-badge decision-${selectedFeedback.decision}`}
                >
                  {selectedFeedback.decision.replace("_", " ")}
                </span>
              </div>

              {/* Feedback Text */}
              <div className="feedback-section">
                <div className="feedback-label">Feedback</div>
                <div className="feedback-text">
                  {selectedFeedback.feedback}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CandidateHistory;