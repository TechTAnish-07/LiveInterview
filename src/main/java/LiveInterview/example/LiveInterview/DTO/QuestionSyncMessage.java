package LiveInterview.example.LiveInterview.DTO;

import lombok.Data;

@Data
public class QuestionSyncMessage {
    private String question;
    private Long timestamp;
}