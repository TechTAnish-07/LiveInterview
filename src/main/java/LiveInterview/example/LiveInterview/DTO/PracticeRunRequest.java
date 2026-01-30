package LiveInterview.example.LiveInterview.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PracticeRunRequest {

    @NotNull
    private Long questionId;

    @NotBlank
    private String sourceCode;

    @NotBlank
    private String language;

    private String stdin;
}
