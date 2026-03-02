import React, { useEffect, useState } from 'react'

const Schedule = () => {
    const [copiedId, setCopiedId] = useState(null);
     useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const res = await api.get("/api/candidate/schedule");
                setInterviews(res.data);
            } catch (error) {
                console.error("Error fetching interview schedule:", error);
            }
        };

        fetchSchedule();
    }, []);
   
    const upcomingInterviews = interviews.filter((i) => {
        return (
            (i.status === "SCHEDULED" || i.status === "LIVE") &&
            new Date(i.endTime) >= now
        );
    });
     const getInterviewUrl = (meetingLink) => {
        return `${window.location.origin}/Prejoin/${meetingLink}`;
    };
    const shareOnWhatsApp = (meetingLink) => {
        const interviewUrl = getInterviewUrl(meetingLink);
        const message = `Hi! You are invited to join the interview.\n\nJoin here 👉 ${interviewUrl}`;
        const encodedMessage = encodeURIComponent(message);

        window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
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
                                    <br />
                                    🕒 {new Date(i.startTime).toLocaleString()} –{" "}
                                    {new Date(i.endTime).toLocaleString()}
                                    <br />
                                    <span>Status: {i.status}</span>
                                    <br />
        
                                    {i.meetingLink && (
                                        <>
                                            <Link
                                                to={`/prejoin/${i.meetingLink}`}
                                                rel="noopener noreferrer"
                                            >
                                                Join Interview
                                            </Link>
        
                                            <div style={{ marginTop: "8px" }}>
                                                <button onClick={() => shareOnWhatsApp(i.meetingLink)}>
                                                    📲 Share via WhatsApp
                                                </button>
        
                                                <button
                                                    onClick={() => copyLink(i.meetingLink, i.interviewId)}
                                                    style={{ marginLeft: "8px" }}
                                                >
                                                 { copiedId === i.interviewId ? (  "Copied!" ) : ( "📋 Copy Link") }
                                                </button>
                                            </div>
                                        </>
                                    )}
        
        
                                </li>
                            ))}
                        </ul>
                    )}
                
      
    </div>
  )
}

export default Schedule
