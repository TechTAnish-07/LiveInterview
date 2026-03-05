package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.Config.WsSessionKeys;
import LiveInterview.example.LiveInterview.DTO.PresenceEvent;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import java.security.Principal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller  // ✅ Changed from @RestController
@RequiredArgsConstructor
@Slf4j
public class PresenceController {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<Long, Map<String, PresenceEvent>> activeUsers = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        log.info("🚀 PresenceController initialized successfully");
    }

    // ✅ Correct path: /app/interview/{interviewId}/presence/join
    @MessageMapping("/interview/{interviewId}/presence/join")
    public void joinPresence(
            @DestinationVariable Long interviewId,
            StompHeaderAccessor accessor,
            Principal user
    ) {
       // log.info("🎯 joinPresence called for interview: {}", interviewId);

        if (user == null) {
        //    log.error("❌ No user principal found");
            return;
        }

        Map<String, Object> sessionAttrs = accessor.getSessionAttributes();
        if (sessionAttrs == null) {
       //     log.error("❌ No session attributes found");
            return;
        }

     //  log.info("📦 Session attributes: {}", sessionAttrs);

        String role = (String) sessionAttrs.get(WsSessionKeys.ROLE);
        if (role == null) {
        log.error("❌ No role found in session for user: {}", user.getName());
       //     log.error("Available keys: {}", sessionAttrs.keySet());
            return;
        }

      //  log.info("✅ Role found: {}", role);

        // Create presence event
        PresenceEvent presence = new PresenceEvent(user.getName(), role, "JOINED");

        // Add to active users
        activeUsers.computeIfAbsent(interviewId, k -> new ConcurrentHashMap<>())
                .put(user.getName(), presence);

//       log.info("✅ User {} (role: {}) JOINED interview {}", user.getName(), role, interviewId);
//       log.info("📊 Total active users in interview {}: {}", interviewId,
//                activeUsers.get(interviewId).size());

        // Broadcast JOIN to everyone subscribed to the topic
        messagingTemplate.convertAndSend(
                "/topic/interview/" + interviewId + "/presence",
                presence
        );

        log.info("📡 Broadcasted JOIN for user: {}", user.getName());

        // Send current user list to this specific user
        List<PresenceEvent> currentUsers = new ArrayList<>(
                activeUsers.getOrDefault(interviewId, Collections.emptyMap()).values()
        );

        messagingTemplate.convertAndSendToUser(
                user.getName(),
                "/queue/presence/snapshot",
                currentUsers
        );

     //   log.info("📋 Sent snapshot of {} users to {}", currentUsers.size(), user.getName());
    }

    public void handleUserLeft(Long interviewId, String userName, String role) {
        if (interviewId == null || userName == null) {
         //   log.warn("⚠️ handleUserLeft called with null values");
            return;
        }

        // Remove from active users
        Map<String, PresenceEvent> users = activeUsers.get(interviewId);
        if (users != null) {
            PresenceEvent removed = users.remove(userName);
            if (removed != null) {
                log.info("🗑️ Removed {} from active users", userName);
            }
            if (users.isEmpty()) {
                activeUsers.remove(interviewId);
                log.info("🧹 Interview {} has no more active users", interviewId);
            }
        }

        // Broadcast LEFT event
        PresenceEvent presence = new PresenceEvent(userName, role, "LEFT");
        messagingTemplate.convertAndSend(
                "/topic/interview/" + interviewId + "/presence",
                presence
        );

       // log.info("👋 User {} LEFT interview {} (broadcasted)", userName, interviewId);
    }
}