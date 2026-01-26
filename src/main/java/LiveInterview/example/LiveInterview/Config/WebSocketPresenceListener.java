package LiveInterview.example.LiveInterview.Config;

import LiveInterview.example.LiveInterview.DTO.PresenceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketPresenceListener {

    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleConnect(SessionConnectedEvent event) {

        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = accessor.getUser();

        if (user == null) return;

        Map<String, Object> sessionAttrs = accessor.getSessionAttributes();
        if (sessionAttrs == null) return;

        Long interviewId = (Long) sessionAttrs.get(WsSessionKeys.INTERVIEW_ID);
        String role = (String) sessionAttrs.get(WsSessionKeys.ROLE);

        if (interviewId == null || role == null) return;

        PresenceEvent presence = new PresenceEvent(
                user.getName(),
                role,
                "JOINED"
        );

        log.info("User {} JOINED interview {}", user.getName(), interviewId);

        messagingTemplate.convertAndSend(
                "/topic/interview/" + interviewId + "/presence",
                presence
        );
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {

        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = accessor.getUser();

        if (user == null) return;

        Map<String, Object> sessionAttrs = accessor.getSessionAttributes();
        if (sessionAttrs == null) return;

        Long interviewId = (Long) sessionAttrs.get(WsSessionKeys.INTERVIEW_ID);
        String role = (String) sessionAttrs.get(WsSessionKeys.ROLE);

        if (interviewId == null || role == null) return;

        PresenceEvent presence = new PresenceEvent(
                user.getName(),
                role,
                "LEFT"
        );

        log.info("User {} LEFT interview {}", user.getName(), interviewId);

        messagingTemplate.convertAndSend(
                "/topic/interview/" + interviewId + "/presence",
                presence
        );
    }
}
