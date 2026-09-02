package LiveInterview.example.LiveInterview.Config;

import LiveInterview.example.LiveInterview.Entity.Interview;
import LiveInterview.example.LiveInterview.Repository.InterviewRepository;
import LiveInterview.example.LiveInterview.Service.CustomUserDetailsService;
import LiveInterview.example.LiveInterview.Service.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@Slf4j
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final InterviewRepository interviewRepository;

    public WebSocketAuthChannelInterceptor(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService,
            InterviewRepository interviewRepository
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.interviewRepository = interviewRepository;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {

            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("❌ Rejecting STOMP CONNECT: Missing or invalid Authorization header");
                return null;
            }

            String token = authHeader.substring(7);

            String username;
            try {
                username = jwtService.extractEmail(token);
            } catch (Exception e) {
                log.error("❌ Rejecting STOMP CONNECT: Failed to extract email from token", e);
                return null;
            }

            UserDetails userDetails;
            try {
                userDetails = userDetailsService.loadUserByUsername(username);
            } catch (Exception e) {
                log.error("❌ Rejecting STOMP CONNECT: User not found: {}", username);
                return null;
            }

            if (!jwtService.isTokenValid(token, userDetails)) {
                log.warn("❌ Rejecting STOMP CONNECT: Invalid token for user: {}", username);
                return null;
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            accessor.setUser(authentication);

            String interviewIdHeader = accessor.getFirstNativeHeader("interviewId");

            if (interviewIdHeader != null) {
                try {
                    Long interviewId = Long.parseLong(interviewIdHeader);
                    Optional<Interview> interviewOpt = interviewRepository.findById(interviewId);

                    if (interviewOpt.isEmpty()) {
                        log.warn("❌ Rejecting STOMP CONNECT: Interview {} not found", interviewId);
                        return null;
                    }

                    Interview interview = interviewOpt.get();
                    String authoritativeRole;

                    boolean isHr = interview.getHr() != null && username.equalsIgnoreCase(interview.getHr().getEmail());
                    boolean isCandidate = (interview.getCandidateEmail() != null && username.equalsIgnoreCase(interview.getCandidateEmail()))
                            || (interview.getCandidate() != null && username.equalsIgnoreCase(interview.getCandidate().getEmail()));
                    boolean isAdmin = userDetails.getAuthorities().stream()
                            .anyMatch(a -> "ADMIN".equalsIgnoreCase(a.getAuthority()) || "ROLE_ADMIN".equalsIgnoreCase(a.getAuthority()));

                    if (isHr) {
                        authoritativeRole = "HR";
                    } else if (isCandidate) {
                        authoritativeRole = "CANDIDATE";
                    } else if (isAdmin) {
                        authoritativeRole = "ADMIN";
                    } else {
                        log.warn("⛔ Rejecting STOMP CONNECT: User {} is not authorized for interview {}", username, interviewId);
                        return null;
                    }

                    Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                    if (sessionAttributes != null) {
                        sessionAttributes.put(WsSessionKeys.INTERVIEW_ID, interviewId);
                        sessionAttributes.put(WsSessionKeys.ROLE, authoritativeRole);
                    }
                    log.info(" Verified user {} with authoritative role {} for interview {}", username, authoritativeRole, interviewId);

                } catch (NumberFormatException e) {
                    log.error("❌ Rejecting STOMP CONNECT: Invalid interviewId format: {}", interviewIdHeader);
                    return null;
                }
            } else {
                log.warn("⚠ No interviewId header found for user: {}", username);
            }
        }

        if (StompCommand.SEND.equals(command)
                || StompCommand.SUBSCRIBE.equals(command)) {

            if (accessor.getUser() == null) {
                log.warn("❌ Rejecting STOMP {}: Unauthenticated user", command);
                return null;
            }
        }

        return message;
    }
}
