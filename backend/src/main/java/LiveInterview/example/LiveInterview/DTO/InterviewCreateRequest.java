package LiveInterview.example.LiveInterview.DTO;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class InterviewCreateRequest {
    private String candidateEmail;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long questionId;
    private List<Long> questionIds;
}

