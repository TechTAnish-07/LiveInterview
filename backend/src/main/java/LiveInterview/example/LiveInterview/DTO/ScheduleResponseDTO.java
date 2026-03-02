package LiveInterview.example.LiveInterview.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class ScheduleResponseDTO {

    private Long interviewId;
    private String hrEmail;

    private String candidateEmail;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private InterviewStatus status;

    private String meetingLink;
}