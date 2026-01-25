package LiveInterview.example.LiveInterview.DTO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InterviewCreateRequest {
    private String candidateEmail;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
