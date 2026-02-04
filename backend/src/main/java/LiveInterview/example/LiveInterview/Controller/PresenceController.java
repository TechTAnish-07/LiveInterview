package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.PresenceEvent;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class PresenceController {

    @MessageMapping("/internal/presence")
    @SendTo("/topic/interview/{interviewId}/presence")
    public PresenceEvent relayPresence(
            PresenceEvent event,
            @Header("interviewId") Long interviewId
    ) {
        return event;
    }
}
