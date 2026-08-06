package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.Entity.AiInterviewSession;
import LiveInterview.example.LiveInterview.Repository.AiInterviewSessionRepository;
import io.livekit.server.WebhookReceiver;
import livekit.LivekitWebhook.WebhookEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/livekit/webhook")
public class LiveKitWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(LiveKitWebhookController.class);

    private final AiInterviewSessionRepository sessionRepository;

    @Value("${livekit.api.key:devkey}")
    private String livekitApiKey;

    @Value("${livekit.api.secret:secret}")
    private String livekitApiSecret;

    public LiveKitWebhookController(AiInterviewSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @PostMapping(consumes = {"application/webhook+json", "application/json", "*/*"})
    public ResponseEntity<String> handleWebhook(
            @RequestBody String body,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            WebhookReceiver receiver = new WebhookReceiver(livekitApiKey, livekitApiSecret);
            WebhookEvent event = receiver.receive(body, authHeader);

            String eventName = event.getEvent();
            logger.info("Received LiveKit webhook event: {}", eventName);

            if (event.hasRoom()) {
                String roomName = event.getRoom().getName();
                logger.info("Webhook event {} for room {}", eventName, roomName);

                Optional<AiInterviewSession> sessionOpt =
                        sessionRepository.findTopByRoomNameOrderByCreatedAtDesc(roomName);

                if (sessionOpt.isPresent()) {
                    AiInterviewSession session = sessionOpt.get();
                    if ("room_started".equalsIgnoreCase(eventName)) {
                        session.setStatus("IN_PROGRESS");
                        sessionRepository.save(session);
                        logger.info("Updated AI interview session {} status to IN_PROGRESS", session.getId());
                    } else if ("room_finished".equalsIgnoreCase(eventName)) {
                        session.setStatus("COMPLETED");
                        sessionRepository.save(session);
                        logger.info("Updated AI interview session {} status to COMPLETED", session.getId());
                    }
                } else {
                    logger.warn("No AiInterviewSession found for roomName: {}", roomName);
                }
            } else {
                logger.info("LiveKit webhook event {} has no room info attached", eventName);
            }
        } catch (Exception e) {
            logger.error("Error processing LiveKit webhook", e);
        }

        return ResponseEntity.ok("ok");
    }
}
