package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.DTO.FeedbackRequest;
import LiveInterview.example.LiveInterview.DTO.FeedbackResponse;
import LiveInterview.example.LiveInterview.DTO.InterviewStatus;
import LiveInterview.example.LiveInterview.Entity.Feedback;
import LiveInterview.example.LiveInterview.Entity.Interview;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.FeedbackRepository;
import LiveInterview.example.LiveInterview.Repository.InterviewRepository;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepo userRepo;
    private final InterviewRepository interviewRepository;

    @Transactional
    public void save(FeedbackRequest request, Principal principal) {

        String email = principal.getName();
        UserEntity hr = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("HR not found"));

        Interview interview = interviewRepository.findById(request.getInterviewId())
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        if (!interview.getHr().getId().equals(hr.getId())) {
            throw new AccessDeniedException("Only HR can submit feedback");
        }

        if (feedbackRepository.existsByInterview(interview)) {
            throw new IllegalStateException("Feedback already submitted");
        }

        Feedback feedback = new Feedback();
        feedback.setInterview(interview);
        feedback.setHr(hr);
        feedback.setFeedback(request.getFeedback());
        feedback.setRating(request.getRating());
        feedback.setInterviewDecision(request.getDecision());
        feedback.setCreatedAt(LocalDateTime.now());

        feedbackRepository.save(feedback);
    }

    // ========================
    // GET FEEDBACK (HR / CANDIDATE)
    // ========================
    @Transactional(readOnly = true)
    public FeedbackResponse getFeedback(Long interviewId, Principal principal) {

        String email = principal.getName();
        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        Feedback feedback = feedbackRepository.findByInterview(interview)
                .orElseThrow(() -> new RuntimeException("Feedback not submitted yet"));

        boolean isHr = interview.getHr().getId().equals(user.getId());
        boolean isCandidate = interview.getCandidate() != null &&
                interview.getCandidate().getId().equals(user.getId());

        if (isCandidate && interview.getStatus() != InterviewStatus.COMPLETED) {
            throw new AccessDeniedException("Feedback not available yet");
        }

        if (!isHr && !isCandidate) {
            throw new AccessDeniedException("Not authorized");
        }

        return new FeedbackResponse(
                interview.getId(),
                feedback.getHr().getName(),
                feedback.getFeedback(),
                feedback.getRating(),
                feedback.getInterviewDecision(),
                feedback.getCreatedAt()
        );
    }
}
