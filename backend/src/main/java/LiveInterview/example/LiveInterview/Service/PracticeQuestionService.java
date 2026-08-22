package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.DTO.Difficulty;
import LiveInterview.example.LiveInterview.DTO.PracticeQuestionResponse;
import LiveInterview.example.LiveInterview.DTO.Topic;
import LiveInterview.example.LiveInterview.Entity.PracticeQuestion;
import LiveInterview.example.LiveInterview.Repository.PracticeQuestionRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
                .map(this::mapToResponse)
                .toList();
    }

    public Page<PracticeQuestionResponse> findQuestions(String search, Topic topic, Difficulty difficulty, Pageable pageable) {
        Specification<PracticeQuestion> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descLike = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(titleLike, descLike));
            }

            if (topic != null) {
                predicates.add(cb.equal(root.get("topic"), topic));
            }

            if (difficulty != null) {
                predicates.add(cb.equal(root.get("difficulty"), difficulty));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };

        return practiceQuestionRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    public PracticeQuestionResponse findById(Long id) {
        PracticeQuestion question = practiceQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Practice question not found with id: " + id));

        return mapToResponse(question);
    }

    @Transactional
    public PracticeQuestionResponse saveQuestion(PracticeQuestion practiceQuestion) {
        PracticeQuestion q = new PracticeQuestion();
        q.setTitle(practiceQuestion.getTitle());
        q.setTopic(practiceQuestion.getTopic());
        q.setDescription(practiceQuestion.getDescription());
        q.setDifficulty(practiceQuestion.getDifficulty());
        q.setConstraints(practiceQuestion.getConstraints());
        q.setExampleInput(practiceQuestion.getExampleInput());
        q.setExampleOutput(practiceQuestion.getExampleOutput());
        q.setCreateTime(practiceQuestion.getCreateTime() != null ? practiceQuestion.getCreateTime() : LocalDateTime.now());

        PracticeQuestion saved = practiceQuestionRepository.save(q);
        return mapToResponse(saved);
    }

    @Transactional
    public PracticeQuestionResponse updateQuestion(Long id, PracticeQuestion updated) {
        PracticeQuestion existing = practiceQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Practice question not found with id: " + id));

        if (updated.getTitle() != null) existing.setTitle(updated.getTitle());
        if (updated.getTopic() != null) existing.setTopic(updated.getTopic());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getDifficulty() != null) existing.setDifficulty(updated.getDifficulty());
        if (updated.getConstraints() != null) existing.setConstraints(updated.getConstraints());
        if (updated.getExampleInput() != null) existing.setExampleInput(updated.getExampleInput());
        if (updated.getExampleOutput() != null) existing.setExampleOutput(updated.getExampleOutput());

        PracticeQuestion saved = practiceQuestionRepository.save(existing);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        if (!practiceQuestionRepository.existsById(id)) {
            throw new RuntimeException("Practice question not found with id: " + id);
        }
        practiceQuestionRepository.deleteById(id);
    }

    public PracticeQuestionResponse mapToResponse(PracticeQuestion q) {
        return PracticeQuestionResponse.builder()
                .id(q.getId())
                .title(q.getTitle())
                .description(q.getDescription())
                .constraints(q.getConstraints())
                .exampleInput(q.getExampleInput())
                .exampleOutput(q.getExampleOutput())
                .difficulty(q.getDifficulty())
                .topic(q.getTopic())
                .createTime(q.getCreateTime())
                .build();
    }
}

