package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.DTO.PresenceEvent;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PresenceService {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<Long, Map<String, PresenceEvent>> activeUsers = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        log.info("🚀 PresenceService initialized successfully");
    }

    public void handleUserJoin(Long interviewId, String userName, String role) {
        if (interviewId == null || userName == null || role == null) {
            return;
        }

        PresenceEvent presence = new PresenceEvent(userName, role, "JOINED");

        activeUsers.computeIfAbsent(interviewId, k -> new ConcurrentHashMap<>())
                .put(userName, presence);

        messagingTemplate.convertAndSend(
                "/topic/interview/" + interviewId + "/presence",
                presence
        );

        log.info("📡 Broadcasted JOIN for user: {} ({}) in interview {}", userName, role, interviewId);

        // Send current online user snapshot to this specific user
        List<PresenceEvent> currentUsers = new ArrayList<>(
                activeUsers.getOrDefault(interviewId, Collections.emptyMap()).values()
        );

        messagingTemplate.convertAndSendToUser(
                userName,
                "/queue/presence/snapshot",
                currentUsers
        );
    }

    public void handleUserLeft(Long interviewId, String userName, String role) {
        if (interviewId == null || userName == null) {
            return;
        }

        Map<String, PresenceEvent> users = activeUsers.get(interviewId);
        if (users != null) {
            PresenceEvent removed = users.remove(userName);
            if (removed != null) {
                log.info("🗑️ Removed {} from active users in interview {}", userName, interviewId);
            }
            if (users.isEmpty()) {
                activeUsers.remove(interviewId);
                log.info("🧹 Interview {} has no more active users", interviewId);
            }
        }

        PresenceEvent presence = new PresenceEvent(userName, role, "LEFT");
        messagingTemplate.convertAndSend(
                "/topic/interview/" + interviewId + "/presence",
                presence
        );
    }

    public List<PresenceEvent> getActiveUsers(Long interviewId) {
        if (interviewId == null) {
            return Collections.emptyList();
        }
        return new ArrayList<>(activeUsers.getOrDefault(interviewId, Collections.emptyMap()).values());
    }
}
