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

     const historyInterviews = interviews.filter((i) => {
        return (
            i.status === "COMPLETED" &&
            new Date(i.endTime) <= now
        );
    });

  return (
    <div>
      <h2>Interview History</h2>
      <ul>
        {historyInterviews.map((interview) => (
          <li key={interview.id}>
            {interview.position} - {interview.date}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default History
