package LiveInterview.example.LiveInterview.Repository;

import LiveInterview.example.LiveInterview.Entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    Optional<Interview> findByMeetingLink(String meetingLink);
    @Modifying
    @Transactional
    @Query("""
     UPDATE Interview i
     SET i.status = InterviewStatus.EXPIRED
     WHERE i.endTime < :now
     AND i.status IN (InterviewStatus.SCHEDULED, InterviewStatus.LIVE)
      """)
    int expireOldInterviews(LocalDateTime now);


}
