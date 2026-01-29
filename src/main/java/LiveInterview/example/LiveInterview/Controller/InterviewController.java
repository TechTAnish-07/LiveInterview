package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.InterviewJoinResponse;
import LiveInterview.example.LiveInterview.Service.InterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/interview")
public class InterviewController {
   private final InterviewService interviewService;

   public InterviewController(InterviewService interviewService
                              ) {
        this.interviewService = interviewService;

   }
    @GetMapping("/join/{meetingLink}")
    public ResponseEntity<InterviewJoinResponse> joinInterview(
            @PathVariable String meetingLink
            ){
       InterviewJoinResponse response =  interviewService.joinInterview(meetingLink );
    return ResponseEntity.ok(response);
    }

}
