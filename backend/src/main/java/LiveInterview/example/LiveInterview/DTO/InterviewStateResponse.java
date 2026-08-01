package LiveInterview.example.LiveInterview.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InterviewStateResponse {
    private String question;
    private String code;
    private String language;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private InterviewStatus status;
    private long serverTime;
}
