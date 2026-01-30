package LiveInterview.example.LiveInterview.Entity;

import LiveInterview.example.LiveInterview.DTO.PracticeStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name ="practice_progress",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "question_id"})
        })
@Data
public class PracticeProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PracticeStatus status;

    @Column(name = "last_attempt_at")
    private LocalDateTime lastAttemptAt;
    @Column(name = "attempt_count")
    private Integer attemptCount;
}
