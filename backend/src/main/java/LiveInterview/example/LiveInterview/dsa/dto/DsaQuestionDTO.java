package LiveInterview.example.LiveInterview.dsa.dto;

import LiveInterview.example.LiveInterview.dsa.entity.DsaDifficulty;
import LiveInterview.example.LiveInterview.dsa.entity.DsaSource;
import LiveInterview.example.LiveInterview.dsa.entity.DsaStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DsaQuestionDTO {
    private Long id;
    private String topic;
    private String title;
    private String link;
    private DsaSource source;
    private DsaDifficulty difficulty;
    private Integer topicOrder;
    private DsaStatus status;
    private Boolean bookmarked;
    private String notes;
}
