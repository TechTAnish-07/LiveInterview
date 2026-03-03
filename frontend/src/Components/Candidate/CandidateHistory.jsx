import React, { useEffect, useState } from "react";
import api from "../Axios";

const CandidateHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [sortOrder, setSortOrder] = useState("newest"); 
  const [statusPriority, setStatusPriority] = useState("none"); 

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
                {new Date(i.startTime).toLocaleString()} →
                {new Date(i.endTime).toLocaleString()}
              </div>
            </div>

            <div
              className={`status-badge status-${i.status}`}
            >
              {i.status}
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
      </div>
    </>
  );
};

export default CandidateHistory;