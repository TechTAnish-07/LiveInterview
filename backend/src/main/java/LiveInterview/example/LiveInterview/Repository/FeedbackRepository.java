package LiveInterview.example.LiveInterview.Repository;

import LiveInterview.example.LiveInterview.Entity.Feedback;
import LiveInterview.example.LiveInterview.Entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback,Integer> {
    boolean existsByInterview(Interview interview);
    Optional<Feedback> findByInterview(Interview interview);
}
