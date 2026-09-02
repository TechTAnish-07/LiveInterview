package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.SecurityFlagDTO;
import LiveInterview.example.LiveInterview.Service.InterviewSecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class InterviewSecurityController {

    private final InterviewSecurityService securityService;

    // No-arg constructor for lightweight test instantiation
    public InterviewSecurityController() {
        this(new InterviewSecurityService());
    }

    @MessageMapping("/interview/{interviewId}/security")
    @SendTo("/topic/interview/{interviewId}/security")
    public SecurityFlagDTO handleSecurityFlag(
            @DestinationVariable String interviewId,
            SecurityFlagDTO flag,
            Principal principal) {
        return securityService.recordFlag(interviewId, flag, principal);
    }

    public SecurityFlagDTO handleSecurityFlag(String interviewId, SecurityFlagDTO flag) {
        return securityService.recordFlag(interviewId, flag);
    }

    @GetMapping("/api/interview/{interviewId}/security-flags")
    public List<SecurityFlagDTO> getInterviewFlags(@PathVariable String interviewId) {
        return securityService.getFlags(interviewId);
    }

    public void clearInterviewFlags(String interviewId) {
        securityService.clearFlags(interviewId);
    }
}