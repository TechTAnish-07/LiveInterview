package LiveInterview.example.LiveInterview.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class InterviewJoinResponse {
    private boolean allowed;
    private Long interviewId;
    private InterviewStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

}
