package LiveInterview.example.LiveInterview.Repository;

import LiveInterview.example.LiveInterview.Entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
}
