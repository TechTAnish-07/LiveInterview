package LiveInterview.example.LiveInterview.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeQuestionResponse {
    private Long id;
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    private String constraints;

    private String exampleInput;
    private String exampleOutput;

    private Difficulty difficulty;
    private Topic topic;
    private LocalDateTime createTime;

    public PracticeQuestionResponse(Long id, String title, String description, String constraints, String exampleInput, String exampleOutput, Difficulty difficulty) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.constraints = constraints;
        this.exampleInput = exampleInput;
        this.exampleOutput = exampleOutput;
        this.difficulty = difficulty;
    }
}

