package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.InterviewCreateRequest;
import LiveInterview.example.LiveInterview.DTO.InterviewCreateResponse;
import LiveInterview.example.LiveInterview.Service.InterviewCreationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hr")
public class InterviewCreationController {
    private final InterviewCreationService interviewCreationService;
    @Autowired
    public InterviewCreationController(InterviewCreationService interviewCreationService) {
        this.interviewCreationService = interviewCreationService;
    }
    @PostMapping("/createInterview")
    public ResponseEntity<?> createInterview(
            @RequestBody InterviewCreateRequest req,
            Authentication authentication
            ) {
        String userEmail =  authentication.getName();
        InterviewCreateResponse response = interviewCreationService.createInterviewLink(req, userEmail);
        return ResponseEntity.ok().build();
    }
}
