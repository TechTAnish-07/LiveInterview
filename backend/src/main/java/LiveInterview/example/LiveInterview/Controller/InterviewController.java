package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.InterviewJoinResponse;
import LiveInterview.example.LiveInterview.Service.InterviewService;
import org.springframework.http.HttpStatus;
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
            String normalized = meetingLink
                    .replace("{", "")
                    .replace("}", "")
                    .trim();
            InterviewJoinResponse response =
                    interviewService.joinInterview(normalized);
            boolean allowed = response.isAllowed();
            if (!allowed) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
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
