package LiveInterview.example.LiveInterview.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InterviewCreateResponse {
    private Long interviewId;
    private String meetingLink;
    private InterviewStatus status;
}
