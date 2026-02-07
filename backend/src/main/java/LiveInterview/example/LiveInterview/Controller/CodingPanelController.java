package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.*;

import LiveInterview.example.LiveInterview.Service.InterviewService;
import LiveInterview.example.LiveInterview.Service.Judge0LiveService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/coding")
public class CodingPanelController {
    private final InterviewService interviewService;
    private final Judge0LiveService judge0LiveService;
    public CodingPanelController(InterviewService interviewService,
                                  Judge0LiveService judge0LiveService

                                 ) {
            this.interviewService = interviewService;
            this.judge0LiveService = judge0LiveService;
    }

    @MessageMapping("/interview/{interviewId}/question")
    @SendTo("/topic/interview/{interviewId}/question")
    public QuestionSyncMessage syncQuestion(
            @DestinationVariable Long interviewId,
            QuestionSyncMessage message,
            Principal principal
    ) {
        if (message == null || message.getQuestion() == null) {
            return null;
        }

        interviewService.verifyHrInInterview(principal, interviewId);

        message.setTimestamp(System.currentTimeMillis());
        interviewService.updateLiveQuestion(interviewId, message, principal);
        return message;
    }
    @GetMapping("/interview/{interviewId}/state")
    public ResponseEntity<InterviewStateResponse> getState(
            @PathVariable Long interviewId,
            Principal principal
    ) {
        interviewService.verifyUserInInterview(principal, interviewId);
        return ResponseEntity.ok(
                interviewService.getInterviewState(interviewId)
        );
    }



    @MessageMapping("/interview/{interviewId}/code")
    @SendTo("/topic/interview/{interviewId}/code")
    public CodeSyncMessage syncCode(
            @DestinationVariable Long interviewId,
            CodeSyncMessage message,
            Principal principal
    ) {
        if (message == null || message.getCode() == null) {
            return null;
        }

        interviewService.verifyUserInInterview(principal, interviewId);

        message.setTimestamp(System.currentTimeMillis());
        interviewService.updateLiveCode(interviewId, message, principal);
        return message;
    }


    @PostMapping("/interview/run")
    public ResponseEntity<?> run(@RequestBody RunRequest request, Principal principal) {

       interviewService.verifyUserInInterview(principal, request.getInterviewId());


       judge0LiveService.runWithLiveOutput(request.getInterviewId(),
               request);
       return ResponseEntity.accepted().build();
   }


}
