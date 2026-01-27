package LiveInterview.example.LiveInterview.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PracticeQuestionRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    private String constraints;

    private String exampleInput;
    private String exampleOutput;

    private String difficulty;
}
