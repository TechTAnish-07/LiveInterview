package LiveInterview.example.LiveInterview.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CodeExecutionRequest {
    private String sourceCode;
    private String language;
    private String stdin;
}
