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
    Optional<AiInterviewSession> findByRoomNameAndUserId(String roomName, Integer userId);
    Optional<AiInterviewSession> findTopByRoomNameAndUserIdOrderByCreatedAtDesc(String roomName, Integer userId);
    List<AiInterviewSession> findByUserId(Integer userId);
}
