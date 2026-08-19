package LiveInterview.example.LiveInterview.dsa.service;

import LiveInterview.example.LiveInterview.dsa.dto.*;
import LiveInterview.example.LiveInterview.dsa.entity.DsaDifficulty;
import LiveInterview.example.LiveInterview.dsa.entity.DsaQuestion;
import LiveInterview.example.LiveInterview.dsa.entity.DsaStatus;
import LiveInterview.example.LiveInterview.dsa.entity.UserQuestionProgress;
import LiveInterview.example.LiveInterview.dsa.repository.DsaQuestionRepository;
import LiveInterview.example.LiveInterview.dsa.repository.UserQuestionProgressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DsaService {

    private final DsaQuestionRepository dsaQuestionRepository;
    private final UserQuestionProgressRepository progressRepository;

    public List<DsaTopicGroupDTO> getQuestionsGroupedByTopic(Long userId, String difficultyFilter, String statusFilter, String searchFilter) {
        List<DsaQuestion> allQuestions = dsaQuestionRepository.findAllByOrderByTopicOrderAscIdAsc();

        Map<Long, UserQuestionProgress> progressMap = Collections.emptyMap();
        if (userId != null) {
            List<UserQuestionProgress> progressList = progressRepository.findByUserId(userId);
            progressMap = progressList.stream()
                    .collect(Collectors.toMap(UserQuestionProgress::getQuestionId, Function.identity(), (existing, replacing) -> replacing));
        }

        // Map all questions into DTOs
        Map<Long, UserQuestionProgress> finalProgressMap = progressMap;
        List<DsaQuestionDTO> dtos = allQuestions.stream().map(q -> {
            UserQuestionProgress p = finalProgressMap.get(q.getId());
            return DsaQuestionDTO.builder()
                    .id(q.getId())
                    .topic(q.getTopic())
                    .title(q.getTitle())
                    .link(q.getLink())
                    .source(q.getSource())
                    .difficulty(q.getDifficulty())
                    .topicOrder(q.getTopicOrder())
                    .status(p != null && p.getStatus() != null ? p.getStatus() : DsaStatus.TODO)
                    .bookmarked(p != null && Boolean.TRUE.equals(p.getBookmarked()))
                    .notes(p != null ? p.getNotes() : null)
                    .build();
        }).collect(Collectors.toList());

        // Group by topic, keeping topic order
        Map<String, List<DsaQuestionDTO>> groupedByTopic = dtos.stream()
                .collect(Collectors.groupingBy(DsaQuestionDTO::getTopic, LinkedHashMap::new, Collectors.toList()));

        List<DsaTopicGroupDTO> result = new ArrayList<>();

        for (Map.Entry<String, List<DsaQuestionDTO>> entry : groupedByTopic.entrySet()) {
            String topic = entry.getKey();
            List<DsaQuestionDTO> topicQuestions = entry.getValue();

            int total = topicQuestions.size();
            int done = (int) topicQuestions.stream().filter(q -> q.getStatus() == DsaStatus.DONE).count();
            int inProgress = (int) topicQuestions.stream().filter(q -> q.getStatus() == DsaStatus.IN_PROGRESS).count();
            int topicOrder = topicQuestions.isEmpty() ? 0 : topicQuestions.get(0).getTopicOrder();

            // Apply optional filters to questions list inside group
            List<DsaQuestionDTO> filteredQuestions = topicQuestions.stream().filter(q -> {
                if (difficultyFilter != null && !difficultyFilter.trim().isEmpty() && !difficultyFilter.equalsIgnoreCase("ALL")) {
                    if (!q.getDifficulty().name().equalsIgnoreCase(difficultyFilter.trim())) {
                        return false;
                    }
                }
                if (statusFilter != null && !statusFilter.trim().isEmpty() && !statusFilter.equalsIgnoreCase("ALL")) {
                    if (!q.getStatus().name().equalsIgnoreCase(statusFilter.trim())) {
                        return false;
                    }
                }
                if (searchFilter != null && !searchFilter.trim().isEmpty()) {
                    String query = searchFilter.trim().toLowerCase();
                    boolean matchTitle = q.getTitle().toLowerCase().contains(query);
                    boolean matchTopic = q.getTopic().toLowerCase().contains(query);
                    if (!matchTitle && !matchTopic) {
                        return false;
                    }
                }
                return true;
            }).collect(Collectors.toList());

            result.add(DsaTopicGroupDTO.builder()
                    .topic(topic)
                    .topicOrder(topicOrder)
                    .totalQuestions(total)
                    .doneQuestions(done)
                    .inProgressQuestions(inProgress)
                    .questions(filteredQuestions)
                    .build());
        }

        // Sort topic groups by topicOrder
        result.sort(Comparator.comparingInt(DsaTopicGroupDTO::getTopicOrder));

        return result;
    }

    @Transactional
    public DsaQuestionDTO updateProgress(Long userId, Long questionId, DsaStatus status, String notes) {
        DsaQuestion question = dsaQuestionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + questionId));

        UserQuestionProgress progress = progressRepository.findByUserIdAndQuestionId(userId, questionId)
                .orElse(UserQuestionProgress.builder()
                        .userId(userId)
                        .questionId(questionId)
                        .status(DsaStatus.TODO)
                        .bookmarked(false)
                        .build());

        if (status != null) {
            progress.setStatus(status);
        }
        if (notes != null) {
            progress.setNotes(notes);
        }

        UserQuestionProgress saved = progressRepository.save(progress);

        return DsaQuestionDTO.builder()
                .id(question.getId())
                .topic(question.getTopic())
                .title(question.getTitle())
                .link(question.getLink())
                .source(question.getSource())
                .difficulty(question.getDifficulty())
                .topicOrder(question.getTopicOrder())
                .status(saved.getStatus())
                .bookmarked(saved.getBookmarked())
                .notes(saved.getNotes())
                .build();
    }

    @Transactional
    public DsaQuestionDTO updateBookmark(Long userId, Long questionId, Boolean bookmarked) {
        DsaQuestion question = dsaQuestionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + questionId));

        UserQuestionProgress progress = progressRepository.findByUserIdAndQuestionId(userId, questionId)
                .orElse(UserQuestionProgress.builder()
                        .userId(userId)
                        .questionId(questionId)
                        .status(DsaStatus.TODO)
                        .bookmarked(false)
                        .build());

        progress.setBookmarked(bookmarked != null && bookmarked);
        UserQuestionProgress saved = progressRepository.save(progress);

        return DsaQuestionDTO.builder()
                .id(question.getId())
                .topic(question.getTopic())
                .title(question.getTitle())
                .link(question.getLink())
                .source(question.getSource())
                .difficulty(question.getDifficulty())
                .topicOrder(question.getTopicOrder())
                .status(saved.getStatus())
                .bookmarked(saved.getBookmarked())
                .notes(saved.getNotes())
                .build();
    }

    @Transactional
    public DsaQuestionDTO updateNotes(Long userId, Long questionId, String notes) {
        DsaQuestion question = dsaQuestionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + questionId));

        UserQuestionProgress progress = progressRepository.findByUserIdAndQuestionId(userId, questionId)
                .orElse(UserQuestionProgress.builder()
                        .userId(userId)
                        .questionId(questionId)
                        .status(DsaStatus.TODO)
                        .bookmarked(false)
                        .build());

        progress.setNotes(notes);
        UserQuestionProgress saved = progressRepository.save(progress);

        return DsaQuestionDTO.builder()
                .id(question.getId())
                .topic(question.getTopic())
                .title(question.getTitle())
                .link(question.getLink())
                .source(question.getSource())
                .difficulty(question.getDifficulty())
                .topicOrder(question.getTopicOrder())
                .status(saved.getStatus())
                .bookmarked(saved.getBookmarked())
                .notes(saved.getNotes())
                .build();
    }

    public DsaProgressSummaryDTO getProgressSummary(Long userId) {
        List<DsaQuestion> allQuestions = dsaQuestionRepository.findAllByOrderByTopicOrderAscIdAsc();

        Map<Long, UserQuestionProgress> progressMap = Collections.emptyMap();
        if (userId != null) {
            List<UserQuestionProgress> progressList = progressRepository.findByUserId(userId);
            progressMap = progressList.stream()
                    .collect(Collectors.toMap(UserQuestionProgress::getQuestionId, Function.identity(), (existing, replacing) -> replacing));
        }

        int total = allQuestions.size();
        int done = 0;
        int inProgress = 0;
        int bookmarked = 0;

        int easyTotal = 0, easyDone = 0;
        int medTotal = 0, medDone = 0;
        int hardTotal = 0, hardDone = 0;

        Map<String, int[]> topicStats = new LinkedHashMap<>(); // [order, total, done, inProgress]

        for (DsaQuestion q : allQuestions) {
            UserQuestionProgress p = progressMap.get(q.getId());
            boolean isDone = p != null && p.getStatus() == DsaStatus.DONE;
            boolean isInProg = p != null && p.getStatus() == DsaStatus.IN_PROGRESS;
            boolean isBkmk = p != null && Boolean.TRUE.equals(p.getBookmarked());

            if (isDone) done++;
            if (isInProg) inProgress++;
            if (isBkmk) bookmarked++;

            // Difficulty breakdown
            if (q.getDifficulty() == DsaDifficulty.EASY) {
                easyTotal++;
                if (isDone) easyDone++;
            } else if (q.getDifficulty() == DsaDifficulty.MEDIUM) {
                medTotal++;
                if (isDone) medDone++;
            } else if (q.getDifficulty() == DsaDifficulty.HARD) {
                hardTotal++;
                if (isDone) hardDone++;
            }

            // Topic breakdown
            topicStats.computeIfAbsent(q.getTopic(), k -> new int[]{q.getTopicOrder() != null ? q.getTopicOrder() : 0, 0, 0, 0});
            int[] stats = topicStats.get(q.getTopic());
            stats[1]++; // total
            if (isDone) stats[2]++; // done
            if (isInProg) stats[3]++; // in progress
        }

        List<DsaProgressSummaryDTO.TopicBreakdownDTO> topicBreakdown = topicStats.entrySet().stream()
                .map(e -> DsaProgressSummaryDTO.TopicBreakdownDTO.builder()
                        .topic(e.getKey())
                        .topicOrder(e.getValue()[0])
                        .total(e.getValue()[1])
                        .done(e.getValue()[2])
                        .inProgress(e.getValue()[3])
                        .build())
                .sorted(Comparator.comparingInt(DsaProgressSummaryDTO.TopicBreakdownDTO::getTopicOrder))
                .collect(Collectors.toList());

        double percentage = total > 0 ? ((double) done / total) * 100.0 : 0.0;

        return DsaProgressSummaryDTO.builder()
                .totalQuestions(total)
                .doneQuestions(done)
                .inProgressQuestions(inProgress)
                .todoQuestions(total - done - inProgress)
                .bookmarkedQuestions(bookmarked)
                .completionPercentage(Math.round(percentage * 10.0) / 10.0)
                .topicBreakdown(topicBreakdown)
                .difficultyBreakdown(DsaProgressSummaryDTO.DifficultyBreakdownDTO.builder()
                        .easy(new DsaProgressSummaryDTO.DifficultyCountDTO(easyTotal, easyDone))
                        .medium(new DsaProgressSummaryDTO.DifficultyCountDTO(medTotal, medDone))
                        .hard(new DsaProgressSummaryDTO.DifficultyCountDTO(hardTotal, hardDone))
                        .build())
                .build();
    }

    public List<DsaQuestionDTO> getBookmarkedQuestions(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }

        List<UserQuestionProgress> bookmarkedProgress = progressRepository.findByUserIdAndBookmarkedTrue(userId);
        if (bookmarkedProgress.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Long, UserQuestionProgress> progressMap = bookmarkedProgress.stream()
                .collect(Collectors.toMap(UserQuestionProgress::getQuestionId, Function.identity(), (a, b) -> a));

        List<DsaQuestion> questions = dsaQuestionRepository.findAllById(progressMap.keySet());

        return questions.stream()
                .map(q -> {
                    UserQuestionProgress p = progressMap.get(q.getId());
                    return DsaQuestionDTO.builder()
                            .id(q.getId())
                            .topic(q.getTopic())
                            .title(q.getTitle())
                            .link(q.getLink())
                            .source(q.getSource())
                            .difficulty(q.getDifficulty())
                            .topicOrder(q.getTopicOrder())
                            .status(p != null && p.getStatus() != null ? p.getStatus() : DsaStatus.TODO)
                            .bookmarked(true)
                            .notes(p != null ? p.getNotes() : null)
                            .build();
                })
                .sorted(Comparator.comparingInt((DsaQuestionDTO q) -> q.getTopicOrder() != null ? q.getTopicOrder() : 0)
                        .thenComparing(DsaQuestionDTO::getTitle))
                .collect(Collectors.toList());
    }
}
