import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../Axios";
import { useAuth } from "../AuthProvider";

const JoinInterview = () => {
  const { meetingLink } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();
  const token = localStorage.getItem("accessToken");

  const mic = location.state?.mic ?? false;
  const camera = location.state?.camera ?? false;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      navigate(`/login?redirect=/join/${meetingLink}`, { replace: true });
      return;
    }

    const join = async () => {
      try {
        const res = await api.get(`/api/interview/join/${meetingLink}`);

        navigate(`/interview/${res.data.interviewId}`, {
          replace: true,
          state: {
            mic,
            camera,
            interview: res.data
          }
        });
      } catch (err) {
        const status = err.response?.status;
        if (status === 403) setError("Not allowed");
        else if (status === 404) setError("Invalid link");
        else setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    join();
  }, [authLoading]);

  if (loading || authLoading) return <p>Joining interview…</p>;
  if (error) return <p>{error}</p>;

  return null;
};

export default JoinInterview;
