package LiveInterview.example.LiveInterview.Config;

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

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@Slf4j
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public WebSocketAuthChannelInterceptor(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
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

                return null;
            }

            String token = authHeader.substring(7);

            String username;
            try {
                username = jwtService.extractEmail(token);
            } catch (Exception e) {
                return null;
            }

            UserDetails userDetails =
                    userDetailsService.loadUserByUsername(username);

            if (!jwtService.isTokenValid(token, userDetails)) {
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
            String roleHeader = accessor.getFirstNativeHeader("role");

            if (interviewIdHeader != null) {
                try {
                    Long interviewId = Long.parseLong(interviewIdHeader);
                    accessor.getSessionAttributes().put(WsSessionKeys.INTERVIEW_ID, interviewId);
                    log.info(" Set interviewId in session: {} for user: {}", interviewId, username);
                } catch (NumberFormatException e) {
                    log.error(" Invalid interviewId format: {}", interviewIdHeader);
                }
            } else {
                log.warn("⚠ No interviewId header found for user: {}", username);
            }

            if (roleHeader != null) {
                accessor.getSessionAttributes().put(WsSessionKeys.ROLE, roleHeader);
                log.info(" Set role in session: {} for user: {}", roleHeader, username);
            } else {
                log.warn("⚠ No role header found for user: {}", username);
            }
        }

        if (StompCommand.SEND.equals(command)
                || StompCommand.SUBSCRIBE.equals(command)) {

            if (accessor.getUser() == null) {
                return null;
            }
        }


        return message;
    }
}
