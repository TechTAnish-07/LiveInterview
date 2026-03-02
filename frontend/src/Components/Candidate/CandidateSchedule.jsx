import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Axios";

const CandidateSchedule = () => {
  const [copiedId, setCopiedId] = useState(null);
  const [interviews, setInterviews] = useState([]);
 
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get("/api/interview/candidate/my-interviews");
        setInterviews(res.data);
      } catch (error) {
        console.error("Error fetching interview schedule:", error);
      }
    };

    fetchSchedule();
  }, []);

  const now = new Date();

  const upcomingInterviews = interviews.filter((i) =>
    (i.status === "SCHEDULED" || i.status === "LIVE") &&
    new Date(i.endTime) >= now
  );

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
    <div>
      <h2>Upcoming Interviews</h2>

      {upcomingInterviews.length === 0 ? (
        <p>No upcoming interviews</p>
      ) : (
        <ul>
          {upcomingInterviews.map((i) => (
            <li key={i.interviewId}>
              <strong>{i.candidateEmail}</strong>
              <strong> {i.hrEmail}</strong> 
              <br />
              🕒 {new Date(i.startTime).toLocaleString()} –{" "}
              {new Date(i.endTime).toLocaleString()}
              <br />
              <span>Status: {i.status}</span>
              <br />
              

              {i.meetingLink && (
                <>
                  <Link to={`/prejoin/${i.meetingLink}`}>
                    Join Interview
                  </Link>

                  <div style={{ marginTop: "8px" }}>
                    <button onClick={() => shareOnWhatsApp(i.meetingLink)}>
                      📲 Share via WhatsApp
                    </button>

                    <button
                      onClick={() =>
                        copyLink(i.meetingLink, i.interviewId)
                      }
                      style={{ marginLeft: "8px" }}
                    >
                      {copiedId === i.interviewId
                        ? "Copied!"
                        : "📋 Copy Link"}
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CandidateSchedule;