package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.Entity.AiInterviewSession;
import LiveInterview.example.LiveInterview.Entity.Resume;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.AiInterviewSessionRepository;
import LiveInterview.example.LiveInterview.Repository.ResumeRepository;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import io.livekit.server.RoomServiceClient;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai-interview")
public class AiInterviewController {

    private static final Logger logger = LoggerFactory.getLogger(AiInterviewController.class);

    private final AiInterviewSessionRepository sessionRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepo userRepo;
    private final RoomServiceClient roomServiceClient;
    private final WebClient webClient;

    @Value("${livekit.api.key}")
    private String livekitApiKey;

    @Value("${livekit.api.secret}")
    private String livekitApiSecret;

    @Value("${livekit.url:ws://localhost:7880}")
    private String livekitUrl;

    @Value("${livekit.token.ttl:7200}")
    private long tokenTtl;

    @Value("${internal.service.api-key}")
    private String internalApiKey;

    @Value("${resume.normalization.service.url:http://localhost:8000}")
    private String resumeNormalizationServiceUrl;


    public AiInterviewController(
            AiInterviewSessionRepository sessionRepository,
            ResumeRepository resumeRepository,
            UserRepo userRepo,
            RoomServiceClient roomServiceClient,
            WebClient.Builder webClientBuilder,
            @Value("${resume.normalization.service.url:http://localhost:8000}") String resumeNormalizationServiceUrl
    ) {
        this.sessionRepository = sessionRepository;
        this.resumeRepository = resumeRepository;
        this.userRepo = userRepo;
        this.roomServiceClient = roomServiceClient;
        this.resumeNormalizationServiceUrl = resumeNormalizationServiceUrl;
        this.webClient = webClientBuilder.baseUrl(resumeNormalizationServiceUrl).build();
    }

    @PostMapping("/start")
    public ResponseEntity<?> startAiInterview(
            @RequestBody(required = false) Map<String, String> body,
            Principal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }

        UserEntity user = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        Long userId = user.getId();
        String roomName = "ai-interview-" + UUID.randomUUID();
        String jobRole = (body != null && body.containsKey("jobRole") && body.get("jobRole") != null)
                ? body.get("jobRole")
                : "Software Engineer";

        // Look up candidate's most recent resume if present
        Optional<Resume> latestResume = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(userId);
        Long resumeId = latestResume.map(Resume::getId).orElse(null);

        // Create session row
        AiInterviewSession session = new AiInterviewSession();
        session.setUserId(userId);
        session.setResumeId(resumeId);
        session.setRoomName(roomName);
        session.setJobRole(jobRole);
        session.setStatus("CREATED");

        AiInterviewSession savedSession = sessionRepository.save(session);

        // Explicitly dispatch Python Voice Agent to LiveKit server for this room
        dispatchAgentToRoom(roomName, savedSession.getId());

        // 1. Build RoomAgentDispatch and RoomConfiguration
        String agentName = "interview-agent";
        String metadataJson = String.format("{\"sessionId\":%d}", savedSession.getId());

        // 2. Log exact agentName string and metadata JSON right before returning the token
        logger.info("Setting LiveKit token agent dispatch: agentName='{}', metadata='{}'", agentName, metadataJson);

        livekit.LivekitAgentDispatch.RoomAgentDispatch agentDispatch =
                livekit.LivekitAgentDispatch.RoomAgentDispatch.newBuilder()
                        .setAgentName(agentName)
                        .setMetadata(metadataJson)
                        .build();

        livekit.LivekitRoom.RoomConfiguration roomConfiguration =
                livekit.LivekitRoom.RoomConfiguration.newBuilder()
                        .addAgents(agentDispatch)
                        .build();

        Map<String, Object> agentDispatchMap = new HashMap<>();
        agentDispatchMap.put("agentName", agentName);
        agentDispatchMap.put("agent_name", agentName);
        agentDispatchMap.put("metadata", metadataJson);

        Map<String, Object> roomConfigMap = new HashMap<>();
        roomConfigMap.put("agents", java.util.List.of(agentDispatchMap));

        // Use io.livekit.server.AccessToken SDK to mint token with RoomConfiguration grants
        io.livekit.server.AccessToken token = new io.livekit.server.AccessToken(livekitApiKey, livekitApiSecret);
        token.setIdentity("user-" + userId);
        token.setName(user.getName());
        token.setTtl(tokenTtl);

        token.addGrants(new io.livekit.server.RoomJoin(true));
        token.addGrants(new io.livekit.server.Room(roomName));
        token.addGrants(new io.livekit.server.Agent(true));
        token.addGrants(createCustomGrant("roomConfig", roomConfigMap));
        token.addGrants(createCustomGrant("room_config", roomConfigMap));

        String jwtToken = token.toJwt();

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", savedSession.getId());
        response.put("roomName", roomName);
        response.put("token", jwtToken);
        response.put("livekitUrl", livekitUrl);

        return ResponseEntity.ok(response);
    }

    private io.livekit.server.VideoGrant createCustomGrant(String key, Object value) {
        try {
            io.livekit.server.VideoGrant grant = new io.livekit.server.Agent(true);
            java.lang.reflect.Field keyField = io.livekit.server.VideoGrant.class.getDeclaredField("key");
            keyField.setAccessible(true);
            keyField.set(grant, key);

            java.lang.reflect.Field valueField = io.livekit.server.VideoGrant.class.getDeclaredField("value");
            valueField.setAccessible(true);
            valueField.set(grant, value);

            return grant;
        } catch (Exception e) {
            logger.warn("Failed to create custom VideoGrant via reflection for key {}: {}", key, e.getMessage());
            return new io.livekit.server.Agent(true);
        }
    }

    private void dispatchAgentToRoom(String roomName, Long sessionId) {
        try {
            Map<String, Object> payload = Map.of(
                    "room", roomName,
                    "session_id", sessionId
            );

            logger.info("Sending WebClient POST to /dispatch-agent with payload: {}", payload);

            webClient.post()
                    .uri("/dispatch-agent")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(String.class)
                    .doOnSuccess(res -> logger.info("Successfully dispatched 'interview-agent' to room {} via WebClient: {}", roomName, res))
                    .doOnError(err -> logger.warn("Failed to dispatch agent for room {}: {}", roomName, err.getMessage()))
                    .subscribe();
        } catch (Exception e) {
            logger.warn("Error initiating WebClient dispatch for room {}: {}", roomName, e.getMessage());
        }
    }


    @GetMapping("/{sessionId}/context")
    public ResponseEntity<?> getInterviewContext(
            @PathVariable Long sessionId,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String headerApiKey
    ) {
        if (headerApiKey == null || !headerApiKey.equals(internalApiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized internal service access"));
        }

        AiInterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "AI Interview session not found"));

        // Look up candidate name
        UserEntity user = userRepo.findById(session.getUserId()).orElse(null);
        String candidateName = user != null ? user.getName() : "Candidate";

        // Look up linked resume text
        String resumeText = null;
        if (session.getResumeId() != null) {
            Optional<Resume> resumeOpt = resumeRepository.findById(session.getResumeId());
            if (resumeOpt.isPresent()) {
                resumeText = resumeOpt.get().getExtractedText();
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("candidateName", candidateName);
        response.put("resumeText", resumeText);
        response.put("jobRole", session.getJobRole() != null ? session.getJobRole() : "Software Engineer");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{sessionId}/result")
    public ResponseEntity<?> saveInterviewResult(
            @PathVariable Long sessionId,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String headerApiKey,
            @RequestBody AiInterviewResultRequest resultRequest
    ) {
        if (headerApiKey == null || !headerApiKey.equals(internalApiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized internal service access"));
        }

        AiInterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "AI Interview session not found"));

        if (resultRequest != null) {
            if (resultRequest.getTranscript() != null) {
                session.setTranscript(resultRequest.getTranscript());
            }
            if (resultRequest.getFeedback() != null) {
                session.setFeedback(resultRequest.getFeedback());
            }
            if (resultRequest.getStatus() != null && !resultRequest.getStatus().isBlank()) {
                session.setStatus(resultRequest.getStatus());
            } else {
                session.setStatus("COMPLETED");
            }
        } else {
            session.setStatus("COMPLETED");
        }

        sessionRepository.save(session);

        return ResponseEntity.ok(Map.of(
                "message", "Interview result saved successfully",
                "sessionId", session.getId()
        ));
    }

    @PostMapping("/{sessionId}/end")
    public ResponseEntity<?> endInterview(
            @PathVariable Long sessionId,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String headerApiKey,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        if (headerApiKey == null || !headerApiKey.equals(internalApiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized internal service access"));
        }

        AiInterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "AI Interview session not found"));

        String reason = (body != null && body.get("reason") != null) ? String.valueOf(body.get("reason")) : "completed";
        session.setStatus("ENDED_" + reason.toUpperCase());
        sessionRepository.save(session);

        logger.info("Session {} ended with reason: {}", sessionId, reason);

        return ResponseEntity.ok(Map.of(
                "message", "Interview session ended successfully",
                "sessionId", session.getId(),
                "reason", reason
        ));
    }

    @DeleteMapping("/{sessionId}/room")
    public ResponseEntity<?> deleteRoomBySessionId(
            @PathVariable Long sessionId,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String headerApiKey,
            Principal principal
    ) {
        AiInterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "AI Interview session not found"));

        validateAccess(session, headerApiKey, principal);

        return executeRoomDeletion(session);
    }

    @DeleteMapping("/room/{roomName}")
    public ResponseEntity<?> deleteRoomByRoomName(
            @PathVariable String roomName,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String headerApiKey,
            Principal principal
    ) {
        AiInterviewSession session = sessionRepository.findTopByRoomNameOrderByCreatedAtDesc(roomName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "AI Interview session not found for room"));

        validateAccess(session, headerApiKey, principal);

        return executeRoomDeletion(session);
    }

    private void validateAccess(AiInterviewSession session, String headerApiKey, Principal principal) {
        boolean isInternal = headerApiKey != null && headerApiKey.equals(internalApiKey);
        if (isInternal) {
            return;
        }

        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized access");
        }

        UserEntity user = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (!session.getUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to modify this session");
        }
    }

    private ResponseEntity<?> executeRoomDeletion(AiInterviewSession session) {
        String roomName = session.getRoomName();
        try {
            retrofit2.Response<Void> response = roomServiceClient.deleteRoom(roomName).execute();
            if (!response.isSuccessful() && response.code() != 404) {
                logger.warn("LiveKit server deleteRoom failed for room {}: {}", roomName,
                        response.errorBody() != null ? response.errorBody().string() : response.message());
            }
        } catch (Exception e) {
            logger.warn("Could not delete room {} on LiveKit server: {}", roomName, e.getMessage());
        }

        session.setStatus("CLOSED");
        sessionRepository.save(session);

        return ResponseEntity.ok(Map.of(
                "message", "AI Interview room deleted successfully",
                "sessionId", session.getId(),
                "roomName", roomName
        ));
    }

    @Data
    public static class AiInterviewResultRequest {
        private String transcript;
        private String feedback;
        private String status;
    }
}
