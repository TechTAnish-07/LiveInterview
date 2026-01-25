package LiveInterview.example.LiveInterview.Entity;

import LiveInterview.example.LiveInterview.DTO.PracticeStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name ="practice_progress",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "question_id"})
        })
public class PracticeProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "question_id", nullable = false)
    private Integer questionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PracticeStatus status;

    @Column(name = "last_attempt_at")
    private LocalDateTime lastAttemptAt;
}
