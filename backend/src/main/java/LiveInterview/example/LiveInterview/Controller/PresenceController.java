package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.Config.WsSessionKeys;
import LiveInterview.example.LiveInterview.DTO.PresenceEvent;
import LiveInterview.example.LiveInterview.Service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class PresenceController {

    private final PresenceService presenceService;

    // Path: /app/interview/{interviewId}/presence/join
    @MessageMapping("/interview/{interviewId}/presence/join")
    public void joinPresence(
            @DestinationVariable Long interviewId,
            StompHeaderAccessor accessor,
            Principal user) {

        if (user == null || accessor == null) {
            return;
        }

        Map<String, Object> sessionAttrs = accessor.getSessionAttributes();
        if (sessionAttrs == null) {
            return;
        }

        String role = (String) sessionAttrs.get(WsSessionKeys.ROLE);
        if (role == null) {
            log.error("❌ No role found in session for user: {}", user.getName());
            return;
        }

        presenceService.handleUserJoin(interviewId, user.getName(), role);
    }

    @GetMapping("/api/interview/{interviewId}/presence")
    @ResponseBody
    public List<PresenceEvent> getActiveUsers(@PathVariable Long interviewId) {
        return presenceService.getActiveUsers(interviewId);
    }
}