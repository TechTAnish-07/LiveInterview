package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.DTO.InterviewJoinResponse;
import LiveInterview.example.LiveInterview.DTO.InterviewStatus;
import LiveInterview.example.LiveInterview.Entity.Interview;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.InterviewRepository;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class InterviewService {
     private final InterviewRepository interviewRepository;
     private final UserRepo userRepo;
     @Autowired
     public InterviewService(InterviewRepository interviewRepository,  UserRepo userRepo) {
         this.interviewRepository = interviewRepository;
         this.userRepo = userRepo;
     }

    public InterviewJoinResponse joinInterview(String meetingLink) {
      //req will give us meeting token so that we can find it is exit or not
        Interview interview = interviewRepository
                .findByMeetingLink(meetingLink)
                .orElseThrow(() -> new RuntimeException("Invalid interview link"));
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        LocalDateTime now = LocalDateTime.now();

        if (now.isBefore(interview.getStartTime())) {
            throw new RuntimeException("Interview not started yet");
        }

        if (now.isAfter(interview.getEndTime())) {
            interview.setStatus(InterviewStatus.EXPIRED);
            interviewRepository.save(interview);
            throw new RuntimeException("Interview expired");
        }

        if (!user.getEmail().equals(interview.getCandidateEmail())) {
            throw new RuntimeException("Not allowed to join this interview");
        }
        if (interview.getCandidate() == null) {
            interview.setCandidate(user);
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
