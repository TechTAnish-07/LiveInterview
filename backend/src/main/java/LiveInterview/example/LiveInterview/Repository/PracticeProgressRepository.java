package LiveInterview.example.LiveInterview.Repository;

import LiveInterview.example.LiveInterview.Entity.PracticeProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PracticeProgressRepository extends JpaRepository<PracticeProgress, Long> {
    Optional<PracticeProgress> findByUserIdAndQuestionId(
            Long userId,
            Long questionId
    );
}
