package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.AuthResponse;
import LiveInterview.example.LiveInterview.DTO.LoginReq;
import LiveInterview.example.LiveInterview.DTO.RegisterRequest;
import LiveInterview.example.LiveInterview.DTO.Role;
import LiveInterview.example.LiveInterview.DTO.UserResponse;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Entity.VerificationToken;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import LiveInterview.example.LiveInterview.Repository.VerificationTokenRepository;
import LiveInterview.example.LiveInterview.Service.BrevoEmailService;
import LiveInterview.example.LiveInterview.Service.CustomUserDetailsService;
import LiveInterview.example.LiveInterview.Service.JwtService;
import LiveInterview.example.LiveInterview.Service.RefreshTokenService;
import LiveInterview.example.LiveInterview.Service.RefreshTokenService.CompromisedTokenException;
import LiveInterview.example.LiveInterview.Service.RefreshTokenService.InvalidRefreshTokenException;
import LiveInterview.example.LiveInterview.Service.RefreshTokenService.RotatedTokenResult;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/auth", "/api/auth"})
public class AuthController {

    private final UserRepo userRepo;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final CustomUserDetailsService customUserDetailsService;
    private final BrevoEmailService emailService;
    private final VerificationTokenRepository verificationTokenRepository;

    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @Autowired
    public AuthController(UserRepo userRepo,
                          AuthenticationManager authManager,
                          JwtService jwtService,
                          RefreshTokenService refreshTokenService,
                          PasswordEncoder passwordEncoder,
                          CustomUserDetailsService customUserDetailsService,
                          BrevoEmailService emailService,
                          VerificationTokenRepository verificationTokenRepository) {
        this.userRepo = userRepo;
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.passwordEncoder = passwordEncoder;
        this.customUserDetailsService = customUserDetailsService;
        this.emailService = emailService;
        this.verificationTokenRepository = verificationTokenRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest req) {
        Optional<UserEntity> existingOpt = userRepo.findByEmail(req.email());
        if (existingOpt.isPresent()) {
            UserEntity existingUser = existingOpt.get();

            if (existingUser.isEnabled()) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("Email already registered");
            }
            emailService.sendVerificationLink(existingUser.getId());

            return ResponseEntity.ok("Verification email resent. Please check your inbox.");
        }

        UserEntity user = new UserEntity();
        user.setEmail(req.email());
        user.setName(req.name());
        user.setRole(Role.CANDIDATE);
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setCreatedDate(LocalDateTime.now());
        user.setEnabled(false);

        customUserDetailsService.save(user);
        emailService.sendVerificationLink(user.getId());

        return ResponseEntity.ok("Registration successful. Please verify your email.");
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        Optional<VerificationToken> optionalToken = verificationTokenRepository.findByToken(token);

        if (optionalToken.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Invalid or already used verification token");
        }

        VerificationToken vt = optionalToken.get();

        if (vt.getExpiryDate().isBefore(LocalDateTime.now())) {
            verificationTokenRepository.delete(vt);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Verification token expired");
        }

        UserEntity user = vt.getUser();
        user.setEnabled(true);
        userRepo.save(user);

        verificationTokenRepository.delete(vt);

        return ResponseEntity.ok("Email verified successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req, HttpServletResponse response) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password())
            );
        } catch (BadCredentialsException | UsernameNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        UserEntity user = userRepo.findByEmail(req.email()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!user.isEnabled()) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Please verify your email before logging in."));
        }

        // 1. Generate short-lived Access Token
        String accessToken = jwtService.generateToken(
                user.getEmail(),
                user.getName(),
                user.getRole().name()
        );

        // 2. Generate secure, hashed server-tracked Refresh Token (starts new token family)
        String rawRefreshToken = refreshTokenService.createRefreshToken(user);

        // 3. Set HttpOnly, Secure, SameSite=None cookie
        setRefreshTokenCookie(response, rawRefreshToken, 7 * 24 * 60 * 60);

        // 4. Return Access Token & User metadata (never expose refresh token in JSON)
        return ResponseEntity.ok(
                new AuthResponse(
                        accessToken,
                        null,
                        new UserResponse(
                                user.getId(),
                                user.getName(),
                                user.getEmail(),
                                user.getRole()
                        )
                )
        );
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Refresh Token Missing"));
        }

        try {
            // 1. Rotate token & verify reuse detection
            RotatedTokenResult result = refreshTokenService.rotateRefreshToken(refreshToken);
            UserEntity user = result.user();

            // 2. Issue new access token
            String newAccessToken = jwtService.generateToken(
                    user.getEmail(),
                    user.getName(),
                    user.getRole().name()
            );

            // 3. Set rotated refresh token in HttpOnly cookie
            setRefreshTokenCookie(response, result.newRefreshToken(), 7 * 24 * 60 * 60);

            return ResponseEntity.ok(
                    new AuthResponse(
                            newAccessToken,
                            null,
                            new UserResponse(
                                    user.getId(),
                                    user.getName(),
                                    user.getEmail(),
                                    user.getRole()
                            )
                    )
            );
        } catch (CompromisedTokenException e) {
            // Breach detected: clear cookie and alert client
            clearRefreshTokenCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Security alert: Token reuse detected. All sessions terminated."));
        } catch (InvalidRefreshTokenException e) {
            clearRefreshTokenCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired refresh token."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenService.revokeRefreshToken(refreshToken);
        }
        clearRefreshTokenCookie(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String token, long maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("None")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("None")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
