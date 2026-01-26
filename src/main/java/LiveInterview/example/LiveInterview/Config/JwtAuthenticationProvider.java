package LiveInterview.example.LiveInterview.Config;

import LiveInterview.example.LiveInterview.Service.CustomUserDetailsService;
import LiveInterview.example.LiveInterview.Service.JwtService;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class JwtAuthenticationProvider implements AuthenticationProvider {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationProvider(JwtService jwtService,
                                     CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Authentication authenticate(Authentication authentication)
            throws AuthenticationException {

        String token = (String) authentication.getCredentials();

        String email = jwtService.extractEmail(token);
        if (email == null) {
            throw new BadCredentialsException("Invalid JWT");
        }

        UserDetails user = userDetailsService.loadUserByUsername(email);

        if (!jwtService.isTokenValid(token, user)) {
            throw new BadCredentialsException("JWT validation failed");
        }

        return new JwtAuthenticationToken(
                user,
                user.getAuthorities()
        );
    }



    @Override
    public boolean supports(Class<?> authentication) {
        return JwtAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
