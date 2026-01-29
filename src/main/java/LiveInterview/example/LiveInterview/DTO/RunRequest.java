package LiveInterview.example.LiveInterview.DTO;

import lombok.Data;

@Data
public class RunRequest {
    private Long interviewId;
    private String sourceCode;
    private String language;
    private String stdin;
}
