package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.CodeSyncMessage;
import LiveInterview.example.LiveInterview.DTO.QuestionSyncMessage;
import LiveInterview.example.LiveInterview.DTO.RunRequest;
import LiveInterview.example.LiveInterview.DTO.RunResponse;
import LiveInterview.example.LiveInterview.Service.InterviewService;
import LiveInterview.example.LiveInterview.Service.Judge0Service;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.AccessDeniedException;
import java.security.Principal;

@RestController
@RequestMapping("/api/coding")
public class CodingPanelController {
    private final InterviewService interviewService;
    private final Judge0Service runService;
    public CodingPanelController(InterviewService interviewService,
                                  Judge0Service runService

                                 ) {
            this.interviewService = interviewService;
            this.runService = runService;
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
         interviewService.verifyUserInInterview(principal, interviewId);

        message.setTimestamp(System.currentTimeMillis());
        interviewService.updateLiveCode(interviewId, message, principal);
        return message;
    }

   @PostMapping("/interview/run")
    public ResponseEntity<RunResponse> run(@RequestBody RunRequest runRequest, Principal principal) {

       interviewService.verifyUserInInterview(principal, runRequest.getInterviewId());
       String token = runService.submit(runRequest);
       RunResponse response = runService.getResult(token);
       return ResponseEntity.ok(response);
   }


}
