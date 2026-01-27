package LiveInterview.example.LiveInterview.Entity;

import LiveInterview.example.LiveInterview.DTO.InterviewDecision;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "feedback",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "interview_id")
        })
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer feedbackId;

    @OneToOne(optional = false)
    @JoinColumn(
            name = "interview_id",
            nullable = false,
            unique = true
    )
    private Interview interview;
    @ManyToOne
    private UserEntity hr;
    @Column(nullable = false)
    private String feedback;

    @Column(nullable = false)
    private Integer rating;
    @Enumerated(EnumType.STRING)
    private InterviewDecision interviewDecision;

    private LocalDateTime createdAt;
}
