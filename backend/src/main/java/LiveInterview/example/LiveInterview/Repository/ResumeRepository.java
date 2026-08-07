package LiveInterview.example.LiveInterview.Repository;

import LiveInterview.example.LiveInterview.Entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    Optional<Resume> findTopByUserIdOrderByUploadedAtDesc(Long userId);
}
