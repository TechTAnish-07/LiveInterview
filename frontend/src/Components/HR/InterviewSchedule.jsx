import React, { useEffect, useState } from "react";
import CreateInterview from "../InterviewRoom/CreateInterview";
import api from "../Axios";

const InterviewSchedule = () => {
    const [showCreateInterview, setShowCreateInterview] = useState(false);
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

    const handleInterviewCreated = (newInterview) => {
        setInterviews((prev) => [...prev, newInterview]);
        setShowCreateInterview(false);

    };

    const now = new Date();

    const upcomingInterviews = interviews.filter((i) => {
        return (
            i.status === "SCHEDULED" &&
            new Date(i.endTime) >= now
        );
    });

    return (
        <div>
            <h1>Interview Schedule</h1>

            {!showCreateInterview && (
                <button onClick={() => setShowCreateInterview(true)}>
                    Create Interview
                </button>
            )}

            {showCreateInterview && (
                <CreateInterview
                    onSuccess={handleInterviewCreated}
                    onClose={() => setShowCreateInterview(false)}
                />
            )}


            <h2>Upcoming Interviews</h2>

            {upcomingInterviews.length === 0 ? (
                <p>No upcoming interviews</p>
            ) : (
                <ul>
                    {upcomingInterviews.map((i) => (
                        <li key={i.interviewId}>

                            <strong>{i.candidateEmail}</strong>
                            <br />
                            🕒 {new Date(i.startTime).toLocaleString()} –{" "}
                            {new Date(i.endTime).toLocaleString()}
                            <br />
                            <span>Status: {i.status}</span>
                            <br />
                            {console.log(i.meetingLink)}
                            {i.meetingLink && (
                                <a href={`/join/${i.meetingLink}`}>
                                    Join Interview
                                </a>



                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default InterviewSchedule;
