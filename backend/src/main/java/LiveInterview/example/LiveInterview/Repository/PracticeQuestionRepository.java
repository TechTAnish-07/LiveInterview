package LiveInterview.example.LiveInterview.Repository;

import LiveInterview.example.LiveInterview.Entity.PracticeQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PracticeQuestionRepository extends JpaRepository<PracticeQuestion, Long> {
}
