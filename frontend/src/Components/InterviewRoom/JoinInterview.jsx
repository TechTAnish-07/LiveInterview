import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Axios";
import { useAuth } from "../AuthProvider";

const JoinInterview = () => {
  const { meetingLink } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=/join/${meetingLink}`, { replace: true });
      return;
    }

    const joinInterview = async () => {
      try {
        const res = await api.get(`/api/interview/join/${meetingLink}`);

        navigate(`/interview/${res.data.interviewId}`, {
          replace: true,
          state: {
            interview: res.data,
            meetingLink,
          },
        });
      } catch (err) {
        const status = err.response?.status;

        if (status === 401) {
          navigate(`/login?redirect=/join/${meetingLink}`, { replace: true });
          return;
        }

        if (status === 403) {
          setError("You are not allowed to join this interview.");
          return;
        }

        if (status === 404) {
          setError("Invalid or expired interview link.");
          return;
        }

        setError("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    joinInterview();
  }, [authLoading, isAuthenticated, meetingLink, navigate]);

  if (authLoading || loading) return <p>Joining interview…</p>;

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
