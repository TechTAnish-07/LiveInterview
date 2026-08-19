package LiveInterview.example.LiveInterview.dsa.repository;

import LiveInterview.example.LiveInterview.dsa.entity.DsaQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DsaQuestionRepository extends JpaRepository<DsaQuestion, Long> {

    List<DsaQuestion> findAllByOrderByTopicOrderAscTitleAsc();

    List<DsaQuestion> findAllByOrderByTopicOrderAscIdAsc();

    Optional<DsaQuestion> findByTopicAndTitle(String topic, String title);

    List<DsaQuestion> findByTopicOrderByTitleAsc(String topic);

    long count();
}
