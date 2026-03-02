import React, { useEffect, useState } from 'react'
import api from '../Axios';

const CandidateHistory = () => {
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
    const historyInterviews = interviews.filter((i) => {
        return (
(           ( i.status === "EXPIRED" &&
            new Date(i.endTime) <= now) || i.status === "COMPLETED" )
        );
    });

    return (
        <div>
            <h2>Interview History</h2>
            {historyInterviews.length === 0 ? (
                <p>  history not found</p>
            ) : (
                <ul>
                    {historyInterviews.map((i) => (
                        <li key={i.interviewId}>
                            {i.hrEmail} — {i.startTime} to {i.endTime} — Status: {i.status}
                        </li>
                    ))}
                   
                </ul>
            )}

        </div>
    )
}

export default CandidateHistory
