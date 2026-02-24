package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.SignalMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class SignalingController {

    @MessageMapping("/signal/{interviewId}")
    @SendTo("/topic/interview/{interviewId}")
    public SignalMessage signal(
            @DestinationVariable String interviewId,
            SignalMessage message,
            Principal principal
    ) {
        message.setFrom(principal.getName());
        return message;
    }
}
