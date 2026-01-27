package LiveInterview.example.LiveInterview.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PracticeQuestionResponse {
    Long id;
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    private String constraints;

    private String exampleInput;
    private String exampleOutput;

    private Difficulty difficulty;
}
