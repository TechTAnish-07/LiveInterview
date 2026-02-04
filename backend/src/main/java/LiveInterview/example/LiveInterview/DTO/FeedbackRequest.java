package LiveInterview.example.LiveInterview.DTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeedbackRequest {
    @NotNull
    private Long interviewId;

    @NotBlank
    private String feedback;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @NotNull
    private InterviewDecision decision;
}
