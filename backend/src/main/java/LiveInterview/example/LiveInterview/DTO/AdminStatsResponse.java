package LiveInterview.example.LiveInterview.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalQuestions;
    private long totalUsers;
    private Map<String, Long> usersByRole;
    private long totalInterviews;
    private Map<String, Long> interviewsByStatus;
}
