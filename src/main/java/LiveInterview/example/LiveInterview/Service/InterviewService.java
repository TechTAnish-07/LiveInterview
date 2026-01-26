package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.DTO.CodeSyncMessage;
import LiveInterview.example.LiveInterview.DTO.InterviewJoinResponse;
import LiveInterview.example.LiveInterview.DTO.InterviewStatus;
import LiveInterview.example.LiveInterview.DTO.QuestionSyncMessage;
import LiveInterview.example.LiveInterview.Entity.Interview;
import LiveInterview.example.LiveInterview.Entity.InterviewCode;
import LiveInterview.example.LiveInterview.Entity.InterviewQuestion;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.InterviewCodeRepository;
import LiveInterview.example.LiveInterview.Repository.InterviewQuestionRepository;
import LiveInterview.example.LiveInterview.Repository.InterviewRepository;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.security.Principal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Service
public class InterviewService {
    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository questionRepo;
    private final InterviewCodeRepository codeRepo;
    private final UserRepo userRepo;
     @Autowired
     public InterviewService(InterviewRepository interviewRepository,  UserRepo userRepo,
                             InterviewQuestionRepository questionRepo,
                             InterviewCodeRepository codeRepo) {
         this.interviewRepository = interviewRepository;
         this.userRepo = userRepo;
         this.questionRepo = questionRepo;
         this.codeRepo = codeRepo;
     }

    @Scheduled(fixedRate = 5000)
    public void autoSave() {
        liveQuestion.keySet().forEach(this::persistQuestion);
        liveCode.keySet().forEach(this::persistCode);
    }


    // 🔥 Replace with Redis in prod
    private final Map<Long, String> liveQuestion = new ConcurrentHashMap<>();
    private final Map<Long, String> liveCode = new ConcurrentHashMap<>();

    public void verifyHrInInterview(Principal principal, Long interviewId) throws AccessDeniedException {
        Interview interview =getInterview(interviewId);
        UserEntity user = getUser(principal);

        if (!interview.getHr().getId().equals(user.getId())) {
            throw new AccessDeniedException("Only HR can edit questions");
        }
    }


    public void updateLiveQuestion(
            Long interviewId,
            QuestionSyncMessage msg,
            Principal principal
    ) {
        liveQuestion.put(interviewId, msg.getQuestion());
    }

    public void updateLiveCode(
            Long interviewId,
            CodeSyncMessage msg,
            Principal principal
    ) {
        liveCode.put(interviewId, msg.getCode());
    }


    public void verifyUserInInterview(Principal principal, Long interviewId) {
        if (principal == null) {
            throw new SecurityException("Unauthenticated access");
        }

        String email = principal.getName();

        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        boolean isHr = interview.getHr().getId().equals(user.getId());
        boolean isCandidate = interview.getCandidate().getId().equals(user.getId());

        if (!isHr && !isCandidate) {
            throw new SecurityException("User is not authorized for this interview");
        }
    }
    public String getUserRoleInInterview(Principal principal, Interview interview) throws AccessDeniedException {

        String email = principal.getName();

        if (interview.getHr() != null &&
                interview.getHr().getEmail().equals(email)) {
            return "HR";
        }

        if (interview.getCandidate() != null &&
                interview.getCandidate().getEmail().equals(email)) {
            return "CANDIDATE";
        }

        throw new AccessDeniedException("User not part of interview");
    }
    @Transactional
    public void persistQuestion(Long interviewId) {
        InterviewQuestion q = questionRepo
                .findById(interviewId)
                .orElse(new InterviewQuestion());

        q.setInterviewId(interviewId);
        q.setQuestionText(liveQuestion.get(interviewId));
        q.setUpdatedAt(System.currentTimeMillis());

        questionRepo.save(q);
    }

    @Transactional
    public void persistCode(Long interviewId) {
        InterviewCode c = codeRepo
                .findById(interviewId)
                .orElse(new InterviewCode());

        c.setInterviewId(interviewId);
        c.setCode(liveCode.get(interviewId));
        c.setUpdatedAt(System.currentTimeMillis());

        codeRepo.save(c);
    }

    private Interview getInterview(Long id) {
        return interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
    }

    private UserEntity getUser(Principal principal) {
        return userRepo.findByEmail(principal.getName())
                .orElseThrow();
    }
}
