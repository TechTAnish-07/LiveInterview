package LiveInterview.example.LiveInterview.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filter that validates the X-Internal-Api-Key header for server-to-server calls
 * (e.g. from InterviewAgent Python microservice).
 */
@Component
public class InternalApiKeyFilter extends OncePerRequestFilter {

    @Value("${internal.service.api-key:}")
    private String internalApiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String headerKey = request.getHeader("X-Internal-Api-Key");

        if (headerKey != null && !headerKey.isBlank() && internalApiKey != null && !internalApiKey.isBlank()) {
            if (headerKey.trim().equals(internalApiKey.trim())) {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                "INTERNAL_SERVICE",
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_INTERNAL_SERVICE"))
                        );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}
