import React, { useState } from "react";
import api from "../Axios";
import { useNavigate, useParams } from "react-router-dom";
import { Star, Award, CheckCircle2, ArrowRight, FileText, Send, User } from "lucide-react";

const Feedback = () => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [decision, setDecision] = useState("SELECTED");
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

      await api.post("/api/feedback/interview", payload);

      setSuccess(true);
      setTimeout(() => {
        navigate(`/dashboard/hr`);
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("Failed to submit feedback report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans flex items-center justify-center p-6 selection:bg-[#d8e2ff]">
      
      <div className="w-full max-w-xl bg-white border border-[#e0e3e5] rounded-2xl shadow-xl overflow-hidden transition-all">
        
        {/* Header */}
        <div className="p-6 bg-[#070235] text-white flex items-center justify-between border-b border-[#1e1b4b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2170e4] flex items-center justify-center text-white shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight">Post-Interview Evaluation Report</h1>
              <span className="text-xs font-mono text-[#8683ba]">Interview Session #{interviewId}</span>
            </div>
          </div>
        </div>

        {success ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#070235]">Evaluation Saved Successfully</h2>
            <p className="text-xs text-[#47464f]">
              Candidate evaluation score and notes have been recorded in HR candidate records. Redirecting to dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={submitFeedback} className="p-8 space-y-6 text-left">
            
            {/* Star Rating Section */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-[#47464f] block">
                Technical Evaluation Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1.5 rounded-lg hover:bg-[#f2f4f6] transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-all ${
                        star <= rating
                          ? "fill-[#0058be] text-[#0058be] scale-110"
                          : "text-[#c8c5d0]"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-mono text-sm font-bold text-[#070235]">
                  {rating}.0 / 5.0
                </span>
              </div>
            </div>

            {/* Hiring Decision Recommendation */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-[#47464f] block">
                Hiring Decision Recommendation
              </label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                required
                className="w-full py-3 px-4 bg-[#f7f9fb] border border-[#c8c5d0] rounded-xl text-xs font-semibold text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20"
              >
                <option value="SELECTED">Strong Hire / Selected</option>
                <option value="ON_HOLD">Consider / On Hold</option>
                <option value="REJECTED">Reject / Needs Improvement</option>
              </select>
            </div>

            {/* Detailed Feedback & Technical Notes */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-[#47464f] block">
                Detailed Feedback & Code Quality Notes
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                placeholder="Provide observations regarding problem solving ability, code structure, communication, and test case accuracy..."
                rows={5}
                className="w-full p-4 bg-[#f7f9fb] border border-[#c8c5d0] rounded-xl text-xs text-[#191c1e] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 leading-relaxed font-sans"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#070235] hover:bg-[#1e1b4b] text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Submitting Evaluation...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#89f5e7]" />
                  <span>Submit Candidate Report</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>

    </div>
  );
};

export default Feedback;