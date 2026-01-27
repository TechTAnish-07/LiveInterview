package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.FeedbackRequest;
import LiveInterview.example.LiveInterview.DTO.FeedbackResponse;
import LiveInterview.example.LiveInterview.Service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {
    private final FeedbackService feedbackService;

    @Autowired
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/interview")
    public ResponseEntity<String> feedback(@RequestBody FeedbackRequest feedbackRequest,
                                           Principal principal) {
        feedbackService.save(feedbackRequest, principal);
        return ResponseEntity.ok().body("success");

    }

    @GetMapping("/interview/{interviewId}")
    public ResponseEntity<FeedbackResponse> getFeedback(
            @PathVariable Long interviewId,
            Principal principal
    ) {
        return ResponseEntity.ok(
                feedbackService.getFeedback(interviewId, principal)
        );
    }
}