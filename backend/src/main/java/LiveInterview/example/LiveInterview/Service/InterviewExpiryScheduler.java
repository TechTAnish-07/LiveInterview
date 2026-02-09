package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.Repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewExpiryScheduler {

    private final InterviewRepository interviewRepository;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expireInterviews() {
        int updated = interviewRepository.expireOldInterviews(LocalDateTime.now());
        if (updated > 0) {
            log.info("Expired {} interviews", updated);
        }
    }
}

