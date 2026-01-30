package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.DTO.PracticeStatus;
import LiveInterview.example.LiveInterview.DTO.RunResponse;
import LiveInterview.example.LiveInterview.Entity.PracticeProgress;
import LiveInterview.example.LiveInterview.Repository.PracticeProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PracticeProgressService {

    private final PracticeProgressRepository progressRepository;

    @Transactional
    public void updateProgress(
            Long userId,
            Long questionId,
            RunResponse response
    ) {

        PracticeProgress progress = progressRepository
                .findByUserIdAndQuestionId(userId, questionId)
                .orElseGet(() -> {
                    PracticeProgress p = new PracticeProgress();
                    p.setUserId(userId);
                    p.setQuestionId(questionId);
                    p.setStatus(PracticeStatus.NOT_STARTED);
                    return p;
                });


        PracticeStatus newStatus = determineStatus(response);

        progress.setStatus(newStatus);
        progress.setLastAttemptAt(LocalDateTime.now());

        progressRepository.save(progress);
    }

    private PracticeStatus determineStatus(RunResponse response) {

        if (response.getStatus().equalsIgnoreCase("Accepted")) {
            return PracticeStatus.SOLVED;
        }

        // Any execution = at least attempted
        return PracticeStatus.ATTEMPTED;
    }
}
