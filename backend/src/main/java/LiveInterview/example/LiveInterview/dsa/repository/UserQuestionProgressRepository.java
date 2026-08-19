package LiveInterview.example.LiveInterview.dsa.repository;

import LiveInterview.example.LiveInterview.dsa.entity.UserQuestionProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserQuestionProgressRepository extends JpaRepository<UserQuestionProgress, Long> {

    List<UserQuestionProgress> findByUserId(Long userId);

    Optional<UserQuestionProgress> findByUserIdAndQuestionId(Long userId, Long questionId);

    List<UserQuestionProgress> findByUserIdAndBookmarkedTrue(Long userId);

    long countByUserId(Long userId);
}
