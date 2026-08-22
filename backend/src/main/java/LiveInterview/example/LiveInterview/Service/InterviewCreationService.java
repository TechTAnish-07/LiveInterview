package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.DTO.*;
import LiveInterview.example.LiveInterview.Entity.Interview;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.InterviewRepository;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

import java.util.UUID;

@Service
public class InterviewCreationService {
    private final UserRepo userRepo;
    private final InterviewRepository interviewRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final LiveInterview.example.LiveInterview.Repository.PracticeQuestionRepository practiceQuestionRepository;
    private final LiveInterview.example.LiveInterview.Repository.InterviewQuestionRepository interviewQuestionRepository;

    @Autowired
    public InterviewCreationService(
            UserRepo userRepo,
            InterviewRepository interviewRepository,
            SimpMessagingTemplate messagingTemplate,
            LiveInterview.example.LiveInterview.Repository.PracticeQuestionRepository practiceQuestionRepository,
            LiveInterview.example.LiveInterview.Repository.InterviewQuestionRepository interviewQuestionRepository
    ) {
        this.userRepo = userRepo;
        this.interviewRepository = interviewRepository;
        this.messagingTemplate = messagingTemplate;
        this.practiceQuestionRepository = practiceQuestionRepository;
        this.interviewQuestionRepository = interviewQuestionRepository;
    }

    public InterviewCreateResponse createInterviewLink(InterviewCreateRequest req, String userEmail) {
        if (req == null || req.getCandidateEmail() == null || req.getCandidateEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Candidate email is required");
        }

        UserEntity hr = userRepo.findByEmail(userEmail).orElseThrow(
                () -> new RuntimeException("User not found"));
        if (hr.getRole() != Role.HR && hr.getRole() != Role.ADMIN) {
            throw new RuntimeException("Role not allowed to create interviews");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = req.getStartTime() != null ? req.getStartTime() : now;
        LocalDateTime endTime = req.getEndTime() != null ? req.getEndTime() : startTime.plusHours(1);

        if (startTime.isBefore(now.minusMinutes(5))) {
            throw new IllegalArgumentException("Start time cannot be in the past");
        }

        if (endTime.isBefore(startTime) || endTime.isEqual(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Interview interview = new Interview();
        interview.setStartTime(startTime);
        interview.setEndTime(endTime);
        interview.setHr(hr);
        interview.setCandidateEmail(req.getCandidateEmail().trim());

        String meeting_link = UUID.randomUUID().toString();
        interview.setMeetingLink(meeting_link);
        Interview saved = interviewRepository.save(interview);

        // Pre-attach selected question(s) from question bank if provided
        List<Long> questionIdsToAttach = new java.util.ArrayList<>();
        if (req.getQuestionId() != null) {
            questionIdsToAttach.add(req.getQuestionId());
        }
        if (req.getQuestionIds() != null) {
            for (Long qId : req.getQuestionIds()) {
                if (qId != null && !questionIdsToAttach.contains(qId)) {
                    questionIdsToAttach.add(qId);
                }
            }
        }

        if (!questionIdsToAttach.isEmpty()) {
            StringBuilder combinedText = new StringBuilder();
            for (Long qId : questionIdsToAttach) {
                practiceQuestionRepository.findById(qId).ifPresent(pq -> {
                    if (!combinedText.isEmpty()) {
                        combinedText.append("\n\n---\n\n");
                    }
                    combinedText.append("### Problem: ").append(pq.getTitle() != null ? pq.getTitle() : "Problem " + qId);
                    if (pq.getDifficulty() != null) {
                        combinedText.append(" [").append(pq.getDifficulty()).append("]");
                    }
                    if (pq.getTopic() != null) {
                        combinedText.append(" (").append(pq.getTopic()).append(")");
                    }
                    combinedText.append("\n\n");
                    if (pq.getDescription() != null && !pq.getDescription().isBlank()) {
                        combinedText.append(pq.getDescription()).append("\n\n");
                    }
                    if (pq.getConstraints() != null && !pq.getConstraints().isBlank()) {
                        combinedText.append("**Constraints:**\n").append(pq.getConstraints()).append("\n\n");
                    }
                    if (pq.getExampleInput() != null && !pq.getExampleInput().isBlank()) {
                        combinedText.append("**Example Input:**\n```\n").append(pq.getExampleInput()).append("\n```\n\n");
                    }
                    if (pq.getExampleOutput() != null && !pq.getExampleOutput().isBlank()) {
                        combinedText.append("**Example Output:**\n```\n").append(pq.getExampleOutput()).append("\n```\n");
                    }
                });
            }

            if (!combinedText.isEmpty()) {
                LiveInterview.example.LiveInterview.Entity.InterviewQuestion iq = new LiveInterview.example.LiveInterview.Entity.InterviewQuestion();
                iq.setInterviewId(saved.getId());
                iq.setQuestionText(combinedText.toString());
                iq.setUpdatedByHrId(hr.getId());
                iq.setUpdatedAt(System.currentTimeMillis());
                interviewQuestionRepository.save(iq);
            }
        }

        return new InterviewCreateResponse(
                saved.getId(),
                saved.getMeetingLink(),
                saved.getStatus()
        );
    }

    public List<InterviewScheduleResponse> getInterviews() {
        return interviewRepository.findAll()
                .stream()
                .map(interview -> new InterviewScheduleResponse(
                        interview.getId(),
                        interview.getCandidateEmail(),
                        interview.getStartTime(),
                        interview.getEndTime(),
                        interview.getMeetingLink(),
                        interview.getStatus()
                ))
                .toList();
    }

    @Transactional
    public void endInterview(Long interviewId, Principal principal) {


        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() ->
                        new RuntimeException("Interview not found with id: " + interviewId));


        String loggedInUserEmail = principal.getName();

        if ( !interview.getHr().getEmail().equals( loggedInUserEmail)) {
            throw new RuntimeException("You are not authorized to end this interview");
        }


        if (interview.getStatus() == InterviewStatus.COMPLETED || interview.getStatus() == InterviewStatus.EXPIRED) {
            throw new RuntimeException("Interview is already ended");
        }


        interview.setStatus(InterviewStatus.COMPLETED);
        interview.setEndTime(LocalDateTime.now());


        interviewRepository.save(interview);

        messagingTemplate.convertAndSend(
                "/topic/interview/" + interviewId + "/ended",
                "Interview has been ended"
        );
    }

}
