package LiveInterview.example.LiveInterview.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "interview_question")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestion {

    @Id
    private Long interviewId;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String questionText;

    private Long updatedByHrId;

    private Long updatedAt;
}
