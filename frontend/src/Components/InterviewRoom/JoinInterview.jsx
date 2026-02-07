import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Axios";

const JoinInterview = () => {
  const { meetingLink } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const joinInterview = async () => {
      try {
        const res = await api.get(`/api/interview/join/${meetingLink}`);

        if (res.data.allowed) {
        
          navigate(`/interview/${res.data.interviewId}`, {
            replace: true,
            state: {
              interview: res.data,
              meetingLink,
            },
          });
        } else {
          setError("You are not allowed to join this interview.");
        }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          "Invalid or expired interview link";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    joinInterview();
  }, [meetingLink, navigate]);

  if (loading) return <p>Joining interview…</p>;

  if (error) {
    return (
      <div>
        <h2>Unable to join interview</h2>
        <p>{error}</p>
      </div>
    );
  }

  return null;
};

export default JoinInterview;
