package LiveInterview.example.LiveInterview.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "interview_code")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewCode {

    @Id
    private Long interviewId;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String code;

    private String language;

    private Long lastUpdatedByUserId;

    private Long updatedAt;
}

