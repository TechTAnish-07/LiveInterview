package LiveInterview.example.LiveInterview.DTO;

import lombok.Data;

@Data
public class CodeSyncMessage {
    private String code;
    private String language;   // cpp / java / python
    private String sender;     // HR / CANDIDATE
    private long timestamp;
}
