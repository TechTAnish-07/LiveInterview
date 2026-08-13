package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.CodeExecutionRequest;
import LiveInterview.example.LiveInterview.DTO.RunResponse;
import LiveInterview.example.LiveInterview.Entity.AiInterviewSession;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.AiInterviewSessionRepository;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import LiveInterview.example.LiveInterview.Service.Judge0Service;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-interview")
public class AiCodingController {

    private static final Logger logger = LoggerFactory.getLogger(AiCodingController.class);

    private final Judge0Service judge0Service;
    private final AiInterviewSessionRepository sessionRepository;
    private final UserRepo userRepo;

    @Value("${internal.service.api-key}")
    private String internalApiKey;

    public AiCodingController(
            Judge0Service judge0Service,
            AiInterviewSessionRepository sessionRepository,
            UserRepo userRepo
    ) {
        this.judge0Service = judge0Service;
        this.sessionRepository = sessionRepository;
        this.userRepo = userRepo;
    }

    /**
     * Agent-facing code execution endpoint (Protected by X-Internal-Api-Key header).
     */
    @PostMapping("/{sessionId}/execute-code")
    public ResponseEntity<?> executeCode(
            @PathVariable Long sessionId,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String headerApiKey,
            @RequestBody AiCodeExecutionRequest request
    ) {
        if (headerApiKey == null || !headerApiKey.equals(internalApiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized internal service access"));
        }

        sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "AI Interview session not found"));

        return executeCodeInternal(sessionId, request);
    }

    /**
     * Candidate-facing code execution endpoint (Protected by candidate JWT via Spring Security).
     */
    @PostMapping("/{sessionId}/run-code")
    public ResponseEntity<?> runCode(
            @PathVariable Long sessionId,
            @RequestBody AiCodeExecutionRequest request,
            Principal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated"));
        }

        UserEntity user = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        AiInterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "AI Interview session not found"));

        if (!session.getUserId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Not authorized to run code for this interview session"));
        }

        return executeCodeInternal(sessionId, request);
    }

    /**
     * Shared execution logic delegating to Judge0Service.
     */
    private ResponseEntity<?> executeCodeInternal(Long sessionId, AiCodeExecutionRequest request) {
        if (request == null || request.getEffectiveCode() == null || request.getEffectiveCode().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Code cannot be empty"));
        }

        if (request.getLanguage() == null || request.getLanguage().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Language cannot be empty"));
        }

        try {
            CodeExecutionRequest execRequest = new CodeExecutionRequest(
                    request.getEffectiveCode(),
                    request.getLanguage(),
                    request.getStdin()
            );

            logger.info("Submitting code execution for AI session {} (language: {})", sessionId, request.getLanguage());
            String token = judge0Service.submit(execRequest);
            RunResponse result = judge0Service.getResult(token);
            logger.info("Code execution finished for AI session {} with status: {}", sessionId, result.getStatus());

            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid code execution request for AI session {}: {}", sessionId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error executing code for AI session {}: {}", sessionId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Code execution failed: " + e.getMessage()));
        }
    }

    @Data
    public static class AiCodeExecutionRequest {
        private String code;
        private String sourceCode;
        private String language;
        private String stdin;

        public String getEffectiveCode() {
            if (code != null && !code.isBlank()) {
                return code;
            }
            return sourceCode;
        }
    }
}
