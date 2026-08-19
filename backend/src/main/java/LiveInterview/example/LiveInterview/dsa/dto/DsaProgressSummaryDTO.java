package LiveInterview.example.LiveInterview.dsa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DsaProgressSummaryDTO {
    private int totalQuestions;
    private int doneQuestions;
    private int inProgressQuestions;
    private int todoQuestions;
    private int bookmarkedQuestions;
    private double completionPercentage;
    private List<TopicBreakdownDTO> topicBreakdown;
    private DifficultyBreakdownDTO difficultyBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicBreakdownDTO {
        private String topic;
        private Integer topicOrder;
        private int total;
        private int done;
        private int inProgress;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DifficultyBreakdownDTO {
        private DifficultyCountDTO easy;
        private DifficultyCountDTO medium;
        private DifficultyCountDTO hard;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DifficultyCountDTO {
        private int total;
        private int done;
    }
}
