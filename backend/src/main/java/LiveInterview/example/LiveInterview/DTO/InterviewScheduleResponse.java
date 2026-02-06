package LiveInterview.example.LiveInterview.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class InterviewScheduleResponse {
    private Long interviewId;
    private String candidateEmail;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String meetingLink;
    private InterviewStatus status;
}
