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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;
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
    private final Map<Long, String> liveQuestion = new ConcurrentHashMap<>();
    private final Map<Long, String> liveCode = new ConcurrentHashMap<>();

    @Scheduled(fixedRate = 5000)
    public void autoSave() {
        liveQuestion.keySet().forEach(this::persistQuestion);
        liveCode.keySet().forEach(this::persistCode);
    }


    // 🔥 Replace with Redis in prod


    public void verifyHrInInterview(Principal principal, Long interviewId) {
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
        System.out.println(
                "📌 updateLiveQuestion called | interviewId=" + interviewId
        );

        liveQuestion.put(interviewId, msg.getQuestion());
    }

    public void updateLiveCode(
            Long interviewId,
            CodeSyncMessage msg,
            Principal principal
    ) {
        System.out.println(
                "🔥 Autosave running | liveQuestion size = " + liveQuestion.size()
        );

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


        boolean isHr = interview.getHr() != null
                && interview.getHr().getId().equals(user.getId());


        boolean isCandidate =
                interview.getCandidate() != null
                        && interview.getCandidate().getId().equals(user.getId());

        boolean isCandidateByEmail =
                interview.getCandidate() == null
                        && interview.getCandidateEmail() != null
                        && interview.getCandidateEmail().equalsIgnoreCase(user.getEmail());

        if (!isHr && !isCandidate && !isCandidateByEmail) {
            throw new SecurityException("User is not authorized for this interview");
        }
    }

    @Transactional
    public void persistQuestion(Long interviewId) {
        System.out.println("💾 Persisting question for interview " + interviewId);
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



    @Transactional
    public InterviewJoinResponse joinInterview(String meetingLink) {

        Interview interview = interviewRepository
                .findByMeetingLink(meetingLink)
                .orElseThrow(() ->
                        new RuntimeException("Invalid or expired interview link"));

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime now = LocalDateTime.now();


        if (now.isBefore(interview.getStartTime())) {
            throw new IllegalStateException("Interview has not started yet");
        }

        if (now.isAfter(interview.getEndTime())) {
            interview.setStatus(InterviewStatus.COMPLETED);
            interviewRepository.save(interview);
            throw new IllegalStateException("Interview has expired");
        }

        // 🔐 Authorization
        boolean isHr = interview.getHr().getId().equals(user.getId());

        boolean isCandidateAllowed =
                interview.getCandidateEmail().equalsIgnoreCase(user.getEmail());

        if (!isHr && !isCandidateAllowed) {
            throw new AccessDeniedException(
                    "This interview is not assigned to your email");
        }

        if (!isHr && interview.getCandidate() != null &&
                !interview.getCandidate().getId().equals(user.getId())) {

            throw new AccessDeniedException("Another candidate has already joined");
        }



        if (interview.getStatus() == InterviewStatus.SCHEDULED) {
            interview.setStatus(InterviewStatus.LIVE);
        }

        interviewRepository.save(interview);


        return new InterviewJoinResponse(
                true,
                interview.getId(),
                interview.getStatus(),
                interview.getStartTime(),
                interview.getEndTime()
        );
    }

}
