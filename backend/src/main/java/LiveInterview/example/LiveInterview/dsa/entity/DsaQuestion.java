package LiveInterview.example.LiveInterview.dsa.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "dsa_question", indexes = {
        @Index(name = "idx_dsa_question_topic", columnList = "topic")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DsaQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String topic;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 500)
    private String link;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DsaSource source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DsaDifficulty difficulty;

    @Column(name = "topic_order", nullable = false)
    private Integer topicOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (topicOrder == null) {
            topicOrder = 0;
        }
    }
}
