package LiveInterview.example.LiveInterview.Repository;

import LiveInterview.example.LiveInterview.Entity.InterviewCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewCodeRepository
        extends JpaRepository<InterviewCode, Long> {
}
