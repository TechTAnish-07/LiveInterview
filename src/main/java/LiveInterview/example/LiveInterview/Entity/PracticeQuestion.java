package LiveInterview.example.LiveInterview.Entity;

import LiveInterview.example.LiveInterview.DTO.Difficulty;
import LiveInterview.example.LiveInterview.DTO.Topic;
import jakarta.persistence.*;
import lombok.Data;


import java.time.LocalDateTime;

@Entity
@Table(name = "practice_question")
@Data
public class PracticeQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private Difficulty difficulty;
    private String constraints;
    private String exampleInput;
    private String exampleOutput;
    private Topic topic;
    private LocalDateTime createTime;
}
