import React, { useEffect, useState } from "react";
import CreateInterview from "../InterviewRoom/CreateInterview";
import api from "../Axios";

const InterviewSchedule = () => {
    const [showCreateInterview, setShowCreateInterview] = useState(false);
    const [interviews, setInterviews] = useState([]);
    const [meetingLink, setMeetingLink] = useState([]);
    const [copy , setCopy] = useState(false);
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
        setMeetingLink((prev) => [...prev, newInterview.meetingLink]);
        setShowCreateInterview(false);

    };

    const now = new Date();

    const upcomingInterviews = interviews.filter((i) => {
        return (
            (i.status === "SCHEDULED" || i.status === "LIVE") &&
            new Date(i.endTime) >= now
        );
    });
    const getInterviewUrl = (meetingLink) => {
        return `${window.location.origin}/join/${meetingLink}`;
    };

    const shareOnWhatsApp = (meetingLink) => {
        const interviewUrl = getInterviewUrl(meetingLink);
        const message = `Hi! You are invited to join the interview.\n\nJoin here 👉 ${interviewUrl}`;
        const encodedMessage = encodeURIComponent(message);

        window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
    };

    const copyLink = async (meetingLink) => {
        const interviewUrl = getInterviewUrl(meetingLink);
        try {
            await navigator.clipboard.writeText(interviewUrl);
            setCopy(true);
            setTimeout(() => setCopy(false), 2000);
            
        } catch (err) {
            alert("Failed to copy link");
        }
    };

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

                            {i.meetingLink && (
                                <>
                                    <a
                                        href={`/join/${i.meetingLink}`}
                                       
                                        rel="noopener noreferrer"
                                    >
                                        Join Interview
                                    </a>

                                    <div style={{ marginTop: "8px" }}>
                                        <button onClick={() => shareOnWhatsApp(i.meetingLink)}>
                                            📲 Share via WhatsApp
                                        </button>

                                        <button
                                            onClick={() => copyLink(i.meetingLink)}
                                            style={{ marginLeft: "8px" }}
                                        >
                                         { copy ? (  "Copied!" ) : ( "📋 Copy Link") }
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

export default InterviewSchedule;
