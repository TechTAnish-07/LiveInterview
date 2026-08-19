package LiveInterview.example.LiveInterview.dsa.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_question_progress",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_question", columnNames = {"user_id", "question_id"})
        },
        indexes = {
                @Index(name = "idx_user_progress_user", columnList = "user_id"),
                @Index(name = "idx_user_progress_question", columnList = "question_id")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserQuestionProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private DsaStatus status = DsaStatus.TODO;

    @Column(nullable = false)
    @Builder.Default
    private Boolean bookmarked = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = DsaStatus.TODO;
        }
        if (this.bookmarked == null) {
            this.bookmarked = false;
        }
    }
}
