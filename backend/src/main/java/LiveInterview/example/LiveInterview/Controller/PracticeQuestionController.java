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
    public ResponseEntity<PracticeQuestionResponse> addQuestion(@RequestBody PracticeQuestion practiceQuestion) {
        PracticeQuestionResponse saved = practiceQuestionService.saveQuestion(practiceQuestion);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/question/{id}")
    public ResponseEntity<PracticeQuestionResponse> updateQuestion(
            @PathVariable Long id,
            @RequestBody PracticeQuestion practiceQuestion
    ) {
        PracticeQuestionResponse updated = practiceQuestionService.updateQuestion(id, practiceQuestion);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/question/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        practiceQuestionService.deleteQuestion(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Question deleted successfully"));
    }

    @GetMapping("/question/{id}")
    public ResponseEntity<PracticeQuestionResponse> getQuestion(@PathVariable Long id) {
        return ResponseEntity.ok(practiceQuestionService.findById(id));
    }

    @GetMapping("/practiceQuestions")
    public ResponseEntity<?> getAllQuestions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Topic topic,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        if (page != null) {
            int pageIndex = Math.max(0, page);
            int pageSize = (size != null && size > 0) ? size : 10;
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                    pageIndex,
                    pageSize,
                    org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createTime")
            );
            return ResponseEntity.ok(practiceQuestionService.findQuestions(search, topic, difficulty, pageable));
        }

        if ((search != null && !search.isBlank()) || topic != null || difficulty != null) {
            org.springframework.data.domain.Pageable unpaged = org.springframework.data.domain.Pageable.unpaged();
            return ResponseEntity.ok(practiceQuestionService.findQuestions(search, topic, difficulty, unpaged).getContent());
        }

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
