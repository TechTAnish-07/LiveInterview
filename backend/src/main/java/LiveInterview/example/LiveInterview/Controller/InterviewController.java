package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.InterviewJoinResponse;
import LiveInterview.example.LiveInterview.Service.InterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;


@RestController
@RequestMapping("/api/interview")
public class InterviewController {
   private final InterviewService interviewService;

   public InterviewController(InterviewService interviewService
                              ) {
        this.interviewService = interviewService;

   }
    @GetMapping("/join/{meetingLink}")
    public ResponseEntity<?> joinInterview(
            @PathVariable String meetingLink,
            Principal principal
    ) {
        try {
            System.out.println("Meeting link received = [" + meetingLink + "]");
            meetingLink = meetingLink.substring(1, meetingLink.length() - 1);
            InterviewJoinResponse response =
                    interviewService.joinInterview(meetingLink);
            return ResponseEntity.ok(response);

        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message", ex.getMessage(),
                            "status", 400
                    )
            );
        }
    }


}
