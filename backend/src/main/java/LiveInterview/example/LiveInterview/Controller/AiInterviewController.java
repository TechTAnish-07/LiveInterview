package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.Entity.AiInterviewSession;
import LiveInterview.example.LiveInterview.Entity.Resume;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.AiInterviewSessionRepository;
import LiveInterview.example.LiveInterview.Repository.ResumeRepository;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai-interview")
public class AiInterviewController {

    private final AiInterviewSessionRepository sessionRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepo userRepo;

    @Value("${livekit.api.key:devkey}")
    private String livekitApiKey;

    @Value("${livekit.api.secret:secret}")
    private String livekitApiSecret;

    @Value("${livekit.url:ws://localhost:7880}")
    private String livekitUrl;

    @Value("${internal.service.api-key:internal-secret-key}")
    private String internalApiKey;

    public AiInterviewController(
            AiInterviewSessionRepository sessionRepository,
            ResumeRepository resumeRepository,
            UserRepo userRepo
    ) {
        this.sessionRepository = sessionRepository;
        this.resumeRepository = resumeRepository;
        this.userRepo = userRepo;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startAiInterview(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }

        UserEntity user = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        Integer userId = user.getId().intValue();
        String roomName = "ai-interview-" + UUID.randomUUID();

        // Look up candidate's most recent resume if present
        Optional<Resume> latestResume = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(userId);
        Long resumeId = latestResume.map(Resume::getId).orElse(null);

        // Create session row
        AiInterviewSession session = new AiInterviewSession();
        session.setUserId(userId);
        session.setResumeId(resumeId);
        session.setRoomName(roomName);
        session.setStatus("CREATED");

        AiInterviewSession savedSession = sessionRepository.save(session);

        // Mint LiveKit access token
        AccessToken token = new AccessToken(livekitApiKey, livekitApiSecret);
        token.setIdentity("user-" + userId);
        token.setName(user.getName());
        token.addGrants(new RoomJoin(true), new RoomName(roomName));
        token.setTtl(7200);

        String jwtToken = token.toJwt();

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", savedSession.getId());
        response.put("roomName", roomName);
        response.put("token", jwtToken);
        response.put("livekitUrl", livekitUrl);

        return ResponseEntity.ok(response);
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
        UserEntity user = userRepo.findById(session.getUserId().longValue()).orElse(null);
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
        response.put("jobRole", "Software Engineer");

        return ResponseEntity.ok(response);
    }
}
