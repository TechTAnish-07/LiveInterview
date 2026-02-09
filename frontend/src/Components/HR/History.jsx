import React, { useEffect, useState } from 'react'
import api from '../Axios';

const History = () => {
    const [interviews, setInterviews] = useState([]);


    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const res = await api.get("/api/hr/schedule");
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
            i.status === "EXPIRED" &&
            new Date(i.endTime) <= now
        );
    });

    return (
        <div>
            <h2>Interview History</h2>
            {historyInterviews.length === 0 ? (
                <p>No interview history found</p>
            ) : (
                <ul>
                    {historyInterviews.map((i) => (
                        <li key={i.interviewId}>
                            {i.candidateEmail} — {i.startTime} to {i.endTime} — Status: {i.status}
                        </li>
                    ))}
                </ul>
            )}

        </div>
    )
}

export default History
