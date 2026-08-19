package LiveInterview.example.LiveInterview.dsa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DsaTopicGroupDTO {
    private String topic;
    private Integer topicOrder;
    private int totalQuestions;
    private int doneQuestions;
    private int inProgressQuestions;
    private List<DsaQuestionDTO> questions;
}
