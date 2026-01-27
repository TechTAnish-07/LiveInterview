package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.CodeSyncMessage;
import LiveInterview.example.LiveInterview.DTO.QuestionSyncMessage;
import LiveInterview.example.LiveInterview.Service.InterviewService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.AccessDeniedException;
import java.security.Principal;

@RestController
@RequestMapping("/api/coding")
public class CodingPanelController {
    private final InterviewService interviewService;
    public CodingPanelController(InterviewService interviewService) {
            this.interviewService = interviewService;
    }

    @MessageMapping("/interview/{interviewId}/question")
    @SendTo("/topic/interview/{interviewId}/question")
    public QuestionSyncMessage syncQuestion(
            @DestinationVariable Long interviewId,
            QuestionSyncMessage message,
            Principal principal
    ) throws AccessDeniedException {
        interviewService.verifyHrInInterview(principal, interviewId);

        message.setTimestamp(System.currentTimeMillis());

        interviewService.updateLiveQuestion(interviewId, message, principal);

        return message;
    }


    @MessageMapping("/interview/{interviewId}/code")
    @SendTo("/topic/interview/{interviewId}/code")
    public CodeSyncMessage syncCode(
            @DestinationVariable Long interviewId,
            CodeSyncMessage message,
            Principal principal
    ) {
        // 🔐 Security check
         interviewService.verifyUserInInterview(principal, interviewId);

        message.setTimestamp(System.currentTimeMillis());
        interviewService.updateLiveCode(interviewId, message, principal);
        return message;
    }




}
