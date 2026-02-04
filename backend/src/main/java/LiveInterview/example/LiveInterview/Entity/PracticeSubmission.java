package LiveInterview.example.LiveInterview.Entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "practice_submission")
public class PracticeSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Lob
    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String language;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "is_final")
    private Boolean isFinal;
}
