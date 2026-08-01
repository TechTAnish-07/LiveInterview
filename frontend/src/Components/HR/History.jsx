import React, { useEffect, useState } from "react";
import api from "../Axios";
import { Search, Filter, Eye, Award, FileText, CheckCircle2, AlertCircle, X, ChevronLeft, ChevronRight } from "lucide-react";

const History = () => {
  const [interviews, setInterviews] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [statusPriority, setStatusPriority] = useState("none");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/hr/schedule");
        setInterviews(res.data || []);
      } catch (error) {
        console.error("Error fetching interview schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const now = new Date();

  const fetchFeedback = async (interviewId) => {
    try {
      const res = await api.get(`/api/feedback/interview/${interviewId}`);
      setSelectedFeedback(res.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFeedback(null);
  };

  let historyInterviews = interviews.filter(
    (i) =>
      ((i.status === "EXPIRED" && new Date(i.endTime) <= now) ||
        i.status === "COMPLETED") &&
      i.candidateEmail?.toLowerCase().includes(search.toLowerCase())
  );

  if (statusPriority === "completedFirst") {
    historyInterviews.sort((a, b) => (a.status === "COMPLETED" ? -1 : 1));
  } else if (statusPriority === "expiredFirst") {
    historyInterviews.sort((a, b) => (a.status === "EXPIRED" ? -1 : 1));
  }

  historyInterviews.sort((a, b) => {
    const dateA = new Date(a.startTime);
    const dateB = new Date(b.startTime);
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(historyInterviews.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = historyInterviews.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#f7f9fb] p-4 rounded-xl border border-[#e0e3e5]">
        
        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#787680] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#c8c5d0] rounded-lg focus:outline-none focus:border-[#0058be] text-[#191c1e]"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1 text-xs font-mono text-[#47464f]">
            <Filter className="w-3.5 h-3.5" />
            <span>Sort:</span>
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="py-1.5 px-3 text-xs bg-white border border-[#c8c5d0] rounded-lg text-[#191c1e] focus:outline-none focus:border-[#0058be]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <select
            value={statusPriority}
            onChange={(e) => setStatusPriority(e.target.value)}
            className="py-1.5 px-3 text-xs bg-white border border-[#c8c5d0] rounded-lg text-[#191c1e] focus:outline-none focus:border-[#0058be]"
          >
            <option value="none">All Statuses</option>
            <option value="completedFirst">Completed First</option>
            <option value="expiredFirst">Expired First</option>
          </select>
        </div>

      </div>

      {/* History Table */}
      {paginatedData.length === 0 ? (
        <div className="text-center py-12 bg-[#f7f9fb] rounded-xl border border-dashed border-[#c8c5d0]">
          <FileText className="w-8 h-8 text-[#787680] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#191c1e]">No past interview records found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#e0e3e5]">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#f2f4f6] text-[#070235] font-mono uppercase text-[11px] border-b border-[#e0e3e5]">
              <tr>
                <th className="py-3 px-4">Candidate Email</th>
                <th className="py-3 px-4">Interview ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5] bg-white">
              {paginatedData.map((item) => (
                <tr key={item.interviewId} className="hover:bg-[#f7f9fb] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#070235]">
                    {item.candidateEmail}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#47464f]">
                    #{item.interviewId}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#47464f]">
                    {new Date(item.startTime).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      item.status === "COMPLETED"
                        ? "bg-[#89f5e7]/40 text-[#005049]"
                        : "bg-[#eceef0] text-[#787680]"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => fetchFeedback(item.interviewId)}
                      className="px-3 py-1.5 bg-[#d8e2ff] hover:bg-[#0058be] text-[#004395] hover:text-white rounded-lg font-semibold text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Report</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs font-mono">
          <span className="text-[#47464f]">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-[#c8c5d0] bg-white text-[#191c1e] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-[#c8c5d0] bg-white text-[#191c1e] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showModal && selectedFeedback && (
        <div className="fixed inset-0 z-50 bg-[#070235]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-[#e0e3e5] rounded-2xl shadow-2xl overflow-hidden transition-all">
            
            {/* Header */}
            <div className="px-6 py-4 bg-[#070235] text-white flex items-center justify-between border-b border-[#1e1b4b]">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#89f5e7]" />
                <div>
                  <h3 className="font-bold text-sm">Technical Candidate Feedback Report</h3>
                  <span className="text-[10px] font-mono text-[#8683ba]">Interview ID #{selectedFeedback.interviewId}</span>
                </div>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg text-[#8683ba] hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 text-left text-xs">
              
              {/* Overall Score & Recommendation */}
              <div className="grid grid-cols-2 gap-4 bg-[#f7f9fb] p-4 rounded-xl border border-[#e0e3e5]">
                <div>
                  <span className="text-[10px] font-mono text-[#787680] uppercase block mb-1">Recommendation</span>
                  <span className="font-bold text-sm text-[#0058be]">{selectedFeedback.recommendation || "Strong Hire"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#787680] uppercase block mb-1">Overall Rating</span>
                  <span className="font-bold text-sm text-[#070235]">{selectedFeedback.rating || 4.5} / 5.0</span>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-1.5">
                <span className="font-mono font-semibold text-[#191c1e] text-[11px] block">Evaluation Comments & Notes</span>
                <p className="bg-[#f2f4f6] p-3 rounded-lg border border-[#e0e3e5] text-[#47464f] leading-relaxed">
                  {selectedFeedback.comments || selectedFeedback.feedback || "Candidate displayed excellent algorithmic clarity and strong code execution performance."}
                </p>
              </div>

            </div>

            <div className="px-6 py-3 bg-[#f2f4f6] border-t border-[#e0e3e5] text-right">
              <button onClick={closeModal} className="px-4 py-2 bg-[#070235] text-white rounded-lg font-semibold text-xs">
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default History;