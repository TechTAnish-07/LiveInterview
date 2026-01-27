package LiveInterview.example.LiveInterview.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class FeedbackResponse {

    private Long interviewId;

    private String hrName;

    private String feedback;

    private Integer rating;

    private InterviewDecision decision;

    private LocalDateTime submittedAt;
}
