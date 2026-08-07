package LiveInterview.example.LiveInterview.Repository;

import LiveInterview.example.LiveInterview.Entity.AiInterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiInterviewSessionRepository extends JpaRepository<AiInterviewSession, Long> {
    List<AiInterviewSession> findByRoomName(String roomName);
    Optional<AiInterviewSession> findTopByRoomNameOrderByCreatedAtDesc(String roomName);
    Optional<AiInterviewSession> findByRoomNameAndUserId(String roomName, Long userId);
    Optional<AiInterviewSession> findTopByRoomNameAndUserIdOrderByCreatedAtDesc(String roomName, Long userId);
    List<AiInterviewSession> findByUserId(Long userId);
}
