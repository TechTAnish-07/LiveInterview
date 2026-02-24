package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.*;
import LiveInterview.example.LiveInterview.Entity.PracticeQuestion;

import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.PracticeQuestionRepository;
import LiveInterview.example.LiveInterview.Service.CustomUserDetailsService;

import LiveInterview.example.LiveInterview.Service.Judge0Service;
import LiveInterview.example.LiveInterview.Service.PracticeProgressService;
import LiveInterview.example.LiveInterview.Service.PracticeQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class PracticeQuestionController {
    private final PracticeQuestionService practiceQuestionService;
    private  final Judge0Service judge0Service;
    private final CustomUserDetailsService customUserDetailsService;
    private final PracticeProgressService practiceProgressService;
    @Autowired
    public PracticeQuestionController(PracticeQuestionService practiceQuestionService,
                                      Judge0Service judge0Service,
                                      CustomUserDetailsService customUserDetailsService,
                                      PracticeProgressService practiceProgressService
                                      ) {
        this.practiceQuestionService = practiceQuestionService;
        this.judge0Service = judge0Service;
       this.customUserDetailsService = customUserDetailsService;
       this.practiceProgressService = practiceProgressService;
    }
    @PostMapping("/question/add")
    public ResponseEntity<?> addQuestion(@RequestBody PracticeQuestion practiceQuestion) {
      practiceQuestionService.saveQuestion(practiceQuestion);
      return ResponseEntity.ok("successfully added");
    }
    @GetMapping("/question/{id}")
    public ResponseEntity<PracticeQuestionResponse> getQuestion(@PathVariable Long id) {
       return ResponseEntity.ok(practiceQuestionService.findById(id));
    }
    @GetMapping("/practiceQuestions")
    public ResponseEntity<List<PracticeQuestionResponse>> getAllQuestions() {
        return ResponseEntity.ok(practiceQuestionService.findAll());
    }

    @PostMapping("/practice/submit")
    public ResponseEntity<RunResponse> submitPracticeCode(
            @RequestBody PracticeRunRequest request,
            Principal principal
    ) throws InterruptedException {
        UserEntity user = customUserDetailsService.getUserFromPrincipal(principal);

        PracticeQuestionResponse question =
                practiceQuestionService.findById(request.getQuestionId());

        CodeExecutionRequest codeExecutionRequest = new CodeExecutionRequest(
                request.getSourceCode(),
                request.getLanguage(),
                request.getStdin()
        );
        String token = judge0Service.submit(codeExecutionRequest);

        RunResponse response = judge0Service.getResult(token);
      // System.out.println("final response of judgeO " + response);
        practiceProgressService.updateProgress(
                user.getId(),
                question.getId(),
                response
        );

        return ResponseEntity.ok(response);
    }

}
