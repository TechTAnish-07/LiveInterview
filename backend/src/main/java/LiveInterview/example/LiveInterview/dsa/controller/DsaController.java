package LiveInterview.example.LiveInterview.dsa.controller;

import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Service.CustomUserDetailsService;
import LiveInterview.example.LiveInterview.dsa.dto.*;
import LiveInterview.example.LiveInterview.dsa.service.DsaCsvImportService;
import LiveInterview.example.LiveInterview.dsa.service.DsaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dsa")
@RequiredArgsConstructor
@Slf4j
public class DsaController {

    private final DsaService dsaService;
    private final DsaCsvImportService dsaCsvImportService;
    private final CustomUserDetailsService customUserDetailsService;

    private Long getUserId(Principal principal) {
        if (principal == null) {
            return null;
        }
        try {
            UserEntity user = customUserDetailsService.getUserFromPrincipal(principal);
            return user != null ? user.getId() : null;
        } catch (Exception e) {
            log.debug("Could not resolve user from principal: {}", e.getMessage());
            return null;
        }
    }

    /**
     * GET /api/dsa/questions
     * Returns all questions grouped by topic with user's progress merged in.
     */
    @GetMapping("/questions")
    public ResponseEntity<List<DsaTopicGroupDTO>> getQuestions(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            Principal principal
    ) {
        Long userId = getUserId(principal);
        List<DsaTopicGroupDTO> groups = dsaService.getQuestionsGroupedByTopic(userId, difficulty, status, search);
        return ResponseEntity.ok(groups);
    }

    /**
     * PATCH /api/dsa/progress/{questionId}
     * Body: { "status": "DONE" }
     */
    @PatchMapping("/progress/{questionId}")
    public ResponseEntity<DsaQuestionDTO> updateProgress(
            @PathVariable Long questionId,
            @RequestBody DsaProgressUpdateRequest request,
            Principal principal
    ) {
        Long userId = getUserId(principal);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        DsaQuestionDTO updated = dsaService.updateProgress(userId, questionId, request.getStatus(), request.getNotes());
        return ResponseEntity.ok(updated);
    }

    /**
     * PATCH /api/dsa/progress/{questionId}/bookmark
     * Body: { "bookmarked": true }
     */
    @PatchMapping("/progress/{questionId}/bookmark")
    public ResponseEntity<DsaQuestionDTO> updateBookmark(
            @PathVariable Long questionId,
            @RequestBody DsaBookmarkUpdateRequest request,
            Principal principal
    ) {
        Long userId = getUserId(principal);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        DsaQuestionDTO updated = dsaService.updateBookmark(userId, questionId, request.getBookmarked());
        return ResponseEntity.ok(updated);
    }

    /**
     * PATCH /api/dsa/progress/{questionId}/notes
     * Body: { "notes": "..." }
     */
    @PatchMapping("/progress/{questionId}/notes")
    public ResponseEntity<DsaQuestionDTO> updateNotes(
            @PathVariable Long questionId,
            @RequestBody DsaNotesUpdateRequest request,
            Principal principal
    ) {
        Long userId = getUserId(principal);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        DsaQuestionDTO updated = dsaService.updateNotes(userId, questionId, request.getNotes());
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/dsa/progress/summary
     * Returns overall stats and topic/difficulty breakdown.
     */
    @GetMapping("/progress/summary")
    public ResponseEntity<DsaProgressSummaryDTO> getSummary(Principal principal) {
        Long userId = getUserId(principal);
        DsaProgressSummaryDTO summary = dsaService.getProgressSummary(userId);
        return ResponseEntity.ok(summary);
    }

    /**
     * GET /api/dsa/bookmarks
     * Returns list of current user's bookmarked questions across topics.
     */
    @GetMapping("/bookmarks")
    public ResponseEntity<List<DsaQuestionDTO>> getBookmarks(Principal principal) {
        Long userId = getUserId(principal);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        List<DsaQuestionDTO> bookmarked = dsaService.getBookmarkedQuestions(userId);
        return ResponseEntity.ok(bookmarked);
    }

    /**
     * POST /api/dsa/import
     * Multipart CSV upload or reload from classpath seed.
     */
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importCsv(@RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            int count;
            if (file != null && !file.isEmpty()) {
                count = dsaCsvImportService.importCsv(file.getInputStream());
            } else {
                count = dsaCsvImportService.importFromClasspathResource("classpath:data/dsa_questions.csv");
            }
            return ResponseEntity.ok(Map.of("message", "Import successful", "processedCount", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/dsa/seed
     * Triggers re-seeding from classpath.
     */
    @PostMapping("/seed")
    public ResponseEntity<?> seedDefaults() {
        int count = dsaCsvImportService.importFromClasspathResource("classpath:data/dsa_questions.csv");
        return ResponseEntity.ok(Map.of("message", "Seeded questions successfully", "count", count));
    }
}
