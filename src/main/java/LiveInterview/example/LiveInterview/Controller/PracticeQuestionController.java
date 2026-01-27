package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.PracticeQuestionResponse;
import LiveInterview.example.LiveInterview.Entity.PracticeQuestion;

import LiveInterview.example.LiveInterview.Service.PracticeQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PracticeQuestionController {
    private final PracticeQuestionService practiceQuestionService;
    @Autowired
    public PracticeQuestionController(PracticeQuestionService practiceQuestionService) {
        this.practiceQuestionService = practiceQuestionService;
    }
    @PostMapping("/question/add")
    public ResponseEntity<?> addQuestion(@RequestBody PracticeQuestion practiceQuestion) {
      practiceQuestionService.saveQuestion(practiceQuestion);
      return ResponseEntity.ok().build();
    }
    @GetMapping("/question/{id}")
    public ResponseEntity<PracticeQuestionResponse> getQuestion(@PathVariable Long id) {
       return ResponseEntity.ok(practiceQuestionService.findById(id));
    }
    @GetMapping("/practiceQuestions")
    public ResponseEntity<List<PracticeQuestionResponse>> getAllQuestions() {
        return ResponseEntity.ok(practiceQuestionService.findAll());
    }

}
