package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.DTO.*;
import LiveInterview.example.LiveInterview.Entity.Interview;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.InterviewRepository;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
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
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    public InterviewCreationService( UserRepo userRepo,  InterviewRepository interviewRepository) {

        this.userRepo = userRepo;
        this.interviewRepository = interviewRepository;

    }
    public InterviewCreateResponse createInterviewLink(InterviewCreateRequest req ,  String userEmail) {
        Interview interview = new Interview();
        LocalDateTime now = LocalDateTime.now();
        UserEntity hr = userRepo.findByEmail(userEmail).orElseThrow(
                () -> new RuntimeException("User not found"));
        if(hr.getRole() != Role.HR){
            throw new RuntimeException("Role not allowed to interview");
        }
        if (req.getStartTime().isBefore(now)) {
            throw new IllegalArgumentException("Start time must be in future");
        }

        if (req.getEndTime().isBefore(req.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        interview.setStartTime(req.getStartTime());
        interview.setEndTime(req.getEndTime());

        interview.setHr(hr);
        interview.setCandidateEmail(req.getCandidateEmail());




        String meeting_link = UUID.randomUUID().toString();
        interview.setMeetingLink(meeting_link);
        Interview saved = interviewRepository.save(interview);
        return new  InterviewCreateResponse(
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
