package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.DTO.PracticeQuestionResponse;
import LiveInterview.example.LiveInterview.Entity.PracticeQuestion;
import LiveInterview.example.LiveInterview.Repository.PracticeQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PracticeQuestionService {
  private final PracticeQuestionRepository practiceQuestionRepository;
  @Autowired
  public PracticeQuestionService(PracticeQuestionRepository practiceQuestionRepository) {
      this.practiceQuestionRepository = practiceQuestionRepository;
  }

    public List<PracticeQuestionResponse> findAll() {
         return practiceQuestionRepository.findAll()
                .stream()
                .map(q -> new PracticeQuestionResponse(
                        q.getId(),
                        q.getTitle(),
                        q.getDescription(),
                        q.getConstraints(),
                        q.getExampleInput(),
                        q.getExampleOutput(),
                        q.getDifficulty()
                ))
                .toList();
    }
    public PracticeQuestionResponse findById(Long id) {
        PracticeQuestion question = practiceQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Practice question not found"));

        return new PracticeQuestionResponse(
                question.getId(),
                question.getTitle(),
                question.getDescription(),
                question.getConstraints(),
                question.getExampleInput(),
                question.getExampleOutput(),
                question.getDifficulty()
        );
    }

    public void saveQuestion(PracticeQuestion practiceQuestion) {
       PracticeQuestion practiceQuestion1= new PracticeQuestion();
       practiceQuestion1.setCreateTime(LocalDateTime.now());
       practiceQuestion1.setTopic(practiceQuestion.getTopic());
       practiceQuestion1.setDescription(practiceQuestion.getDescription());
       practiceQuestion1.setDifficulty(practiceQuestion.getDifficulty());
       practiceQuestion1.setConstraints(practiceQuestion.getConstraints());
       practiceQuestion1.setExampleInput(practiceQuestion.getExampleInput());
       practiceQuestion1.setExampleOutput(practiceQuestion.getExampleOutput());
       practiceQuestionRepository.save(practiceQuestion1);
    }
}
