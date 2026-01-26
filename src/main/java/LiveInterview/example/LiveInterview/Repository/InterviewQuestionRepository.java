package LiveInterview.example.LiveInterview.Repository;

import LiveInterview.example.LiveInterview.Entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewQuestionRepository
        extends JpaRepository<InterviewQuestion, Long> {
}
