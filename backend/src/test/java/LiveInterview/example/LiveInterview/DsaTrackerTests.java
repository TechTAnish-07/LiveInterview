package LiveInterview.example.LiveInterview;

import LiveInterview.example.LiveInterview.dsa.dto.*;
import LiveInterview.example.LiveInterview.dsa.entity.DsaDifficulty;
import LiveInterview.example.LiveInterview.dsa.entity.DsaQuestion;
import LiveInterview.example.LiveInterview.dsa.entity.DsaSource;
import LiveInterview.example.LiveInterview.dsa.entity.DsaStatus;
import LiveInterview.example.LiveInterview.dsa.entity.UserQuestionProgress;
import LiveInterview.example.LiveInterview.dsa.repository.DsaQuestionRepository;
import LiveInterview.example.LiveInterview.dsa.repository.UserQuestionProgressRepository;
import LiveInterview.example.LiveInterview.dsa.service.DsaCsvImportService;
import LiveInterview.example.LiveInterview.dsa.service.DsaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ResourceLoader;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DsaTrackerTests {

    @Mock
    private DsaQuestionRepository questionRepository;

    @Mock
    private UserQuestionProgressRepository progressRepository;

    @Mock
    private ResourceLoader resourceLoader;

    private DsaCsvImportService csvImportService;
    private DsaService dsaService;

    @BeforeEach
    void setUp() {
        csvImportService = new DsaCsvImportService(questionRepository, resourceLoader);
        dsaService = new DsaService(questionRepository, progressRepository);
    }

    @Test
    void testInferSource() {
        assertEquals(DsaSource.LEETCODE, csvImportService.inferSource("https://leetcode.com/problems/two-sum"));
        assertEquals(DsaSource.GFG, csvImportService.inferSource("https://www.geeksforgeeks.org/dijkstras-algorithm"));
        assertEquals(DsaSource.OTHER, csvImportService.inferSource("https://codeforces.com/problemset/problem/1/A"));
    }

    @Test
    void testParseDifficulty() {
        assertEquals(DsaDifficulty.EASY, csvImportService.parseDifficulty("Easy"));
        assertEquals(DsaDifficulty.MEDIUM, csvImportService.parseDifficulty("MEDIUM"));
        assertEquals(DsaDifficulty.HARD, csvImportService.parseDifficulty("hard"));
        assertEquals(DsaDifficulty.MEDIUM, csvImportService.parseDifficulty("Unknown"));
    }

    @Test
    void testCsvImport() {
        String csvContent = "topic,question_name,link,difficulty\n" +
                "Arrays,Reverse the array,https://leetcode.com/problems/reverse-array,Easy\n" +
                "Graph,Dijkstra's Algorithm,https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm,Hard\n";

        when(questionRepository.findByTopicAndTitle(anyString(), anyString())).thenReturn(Optional.empty());

        int count = csvImportService.importCsv(new ByteArrayInputStream(csvContent.getBytes(StandardCharsets.UTF_8)));
        assertEquals(2, count);
        verify(questionRepository, times(2)).save(any(DsaQuestion.class));
    }

    @Test
    void testUpdateProgressAndSummary() {
        DsaQuestion q1 = DsaQuestion.builder()
                .id(1L)
                .topic("Arrays")
                .title("Two Sum")
                .link("https://leetcode.com/problems/two-sum")
                .source(DsaSource.LEETCODE)
                .difficulty(DsaDifficulty.EASY)
                .topicOrder(1)
                .build();

        DsaQuestion q2 = DsaQuestion.builder()
                .id(2L)
                .topic("Arrays")
                .title("Kadane's Algorithm")
                .link("https://leetcode.com/problems/maximum-subarray")
                .source(DsaSource.LEETCODE)
                .difficulty(DsaDifficulty.MEDIUM)
                .topicOrder(1)
                .build();

        when(questionRepository.findAllByOrderByTopicOrderAscIdAsc()).thenReturn(List.of(q1, q2));
        when(questionRepository.findById(1L)).thenReturn(Optional.of(q1));
        when(progressRepository.findByUserIdAndQuestionId(10L, 1L)).thenReturn(Optional.empty());
        when(progressRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // Update progress to DONE
        DsaQuestionDTO updated = dsaService.updateProgress(10L, 1L, DsaStatus.DONE, "Solved with hashmap");
        assertNotNull(updated);
        assertEquals(DsaStatus.DONE, updated.getStatus());
        assertEquals("Solved with hashmap", updated.getNotes());

        // Get progress summary
        UserQuestionProgress p1 = UserQuestionProgress.builder()
                .userId(10L)
                .questionId(1L)
                .status(DsaStatus.DONE)
                .bookmarked(true)
                .build();

        when(progressRepository.findByUserId(10L)).thenReturn(List.of(p1));
        DsaProgressSummaryDTO summary = dsaService.getProgressSummary(10L);

        assertEquals(2, summary.getTotalQuestions());
        assertEquals(1, summary.getDoneQuestions());
        assertEquals(1, summary.getBookmarkedQuestions());
        assertEquals(50.0, summary.getCompletionPercentage());
        assertEquals(1, summary.getDifficultyBreakdown().getEasy().getDone());
    }
}
