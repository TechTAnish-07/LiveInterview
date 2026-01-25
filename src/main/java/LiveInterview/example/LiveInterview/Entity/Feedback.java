package LiveInterview.example.LiveInterview.Entity;

import jakarta.persistence.*;
import lombok.Data;

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
    @Column(name = "interview_id", nullable = false, unique = true)
    private Integer interviewId;

    @Column(nullable = false)
    private String feedback;

    @Column(nullable = false)
    private Integer rating;

    private String decision;
}
