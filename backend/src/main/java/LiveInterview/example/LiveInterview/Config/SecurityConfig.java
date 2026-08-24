package LiveInterview.example.LiveInterview.Config;

import LiveInterview.example.LiveInterview.Service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final InternalApiKeyFilter internalApiKeyFilter;
    private final CustomUserDetailsService userDetailsService;

    /**
     * Explicit list of allowed CORS origins configured via application properties or environment variable.
     * Replaces unsafe wildcard subdomains (*.vercel.app, *.onrender.com) to prevent cross-origin credential theft.
     */
    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,https://live-interview-ten.vercel.app,https://liveintervieww.tech}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          InternalApiKeyFilter internalApiKeyFilter,
                          CustomUserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.internalApiKeyFilter = internalApiKeyFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS Configuration:
     * - Uses an explicit, configurable allowlist of trusted origins without wildcard multi-tenant subdomains.
     * - allowCredentials(true) is strictly required because the application sets and validates HTTP-only
     *   refresh token cookies (/auth/refresh-token) during authentication.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        config.setAllowedOrigins(origins);
        config.setAllowCredentials(true);
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // CSRF is disabled as the application uses stateless JWT bearer tokens
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 1. HTTP Preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Public auth endpoints (Login, Registration, Token Verification)
                        .requestMatchers("/auth/**", "/api/auth/**").permitAll()

                        // 3. WebSockets & API documentation
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // 4. Webhooks (validated at controller level via signature / webhook secrets)
                        .requestMatchers("/livekit/webhook").permitAll()

                        // 5. Role-based administrative & recruiter management endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/hr/**").hasAnyRole("HR", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/question/add").hasAnyRole("HR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/question/**").hasAnyRole("HR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/question/**").hasAnyRole("HR", "ADMIN")
                        .requestMatchers("/api/feedback/**").hasAnyRole("HR", "CANDIDATE", "ADMIN")
                        .requestMatchers("/api/dsa/**").authenticated()

                        /*
                         * 6. AI-Interview Endpoints & Code Execution Security:
                         *
                         * PREVIOUS ISSUE:
                         * Endpoints such as /execute-code, /context, /result, /end, /feedback, and /room
                         * were previously permitAll(), leaving code execution and interview session data
                         * vulnerable to unauthenticated, anonymous exploitation.
                         *
                         * SCOPED SECURITY MODEL:
                         * - These endpoints now require authentication (.authenticated()).
                         * - Code execution (/execute-code) and session management endpoints (/context, /result,
                         *   /end, /feedback) require an authenticated participant session or a validated
                         *   internal service key (X-Internal-Api-Key) scoped to the specific session/room ID.
                         * - Candidate self-service endpoints (/start, /run-code, /history, /check-eligibility)
                         *   require an authenticated candidate JWT, ensuring only legitimate participants
                         *   tied to that specific interview session can execute code or access context.
                         */
                        .requestMatchers("/api/ai-interview/**").authenticated()

                        // 7. All other application endpoints require authentication
                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(internalApiKeyFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * AuthenticationManager Bean:
     *
     * ROLE & USAGE:
     * - This bean IS actively used by AuthController (e.g. in /auth/login) to authenticate candidate/HR
     *   credentials (email + raw password) before generating JWT access and refresh tokens.
     * - It is intentionally instantiated with DaoAuthenticationProvider, CustomUserDetailsService,
     *   and PasswordEncoder without registering a separate redundant AuthenticationProvider bean
     *   in the application context, avoiding Spring Security auto-configuration warnings.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }
}
