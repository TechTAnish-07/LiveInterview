package LiveInterview.example.LiveInterview.Repository;

import LiveInterview.example.LiveInterview.Entity.AiFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiFeedbackRepository extends JpaRepository<AiFeedback, Long> {
    Optional<AiFeedback> findBySessionId(Long sessionId);
    boolean existsBySessionId(Long sessionId);
}
