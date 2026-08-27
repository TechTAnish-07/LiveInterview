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
import LiveInterview.example.LiveInterview.Service.EmailService;
import LiveInterview.example.LiveInterview.Service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
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
   private final PasswordEncoder passwordEncoder;
   private final CustomUserDetailsService customUserDetailsService;
   private final BrevoEmailService emailService;
   private final VerificationTokenRepository verificationTokenRepository;
   @Autowired
   public AuthController(UserRepo userRepo, AuthenticationManager authManager,
                         JwtService jwtService ,
                         PasswordEncoder passwordEncoder,
                         CustomUserDetailsService customUserDetailsService,
                         BrevoEmailService emailService,
                         VerificationTokenRepository verificationTokenRepository
                         ) {
      this.userRepo = userRepo;
      this.authManager = authManager;
      this.jwtService = jwtService;
      this.passwordEncoder = passwordEncoder;
      this.customUserDetailsService = customUserDetailsService;
      this.emailService = emailService;
      this.verificationTokenRepository = verificationTokenRepository;
   }

   @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest req ) {
       Optional<UserEntity> existingOpt = userRepo.findByEmail(req.email());
      if (existingOpt.isPresent()) {
         UserEntity existingUser = existingOpt.get();
         System.out.println("user already existed");

         if (existingUser.isEnabled()) {
            System.out.println("is enabled");
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Email already registered");
         }
         System.out.println("user existed but is not enabled");
         emailService.sendVerificationLink(existingUser.getId());


         return ResponseEntity.ok(
                 "Verification email resent. Please check your inbox."
         );
      }

      UserEntity user = new UserEntity();
      user.setEmail(req.email());
      user.setName(req.name());
      // Security fix: public self-registration defaults strictly to CANDIDATE role
      user.setRole(Role.CANDIDATE);
      user.setPassword(passwordEncoder.encode(req.password()));
      user.setCreatedDate(LocalDateTime.now());
      user.setEnabled(false);

      customUserDetailsService.save(user);
     emailService.sendVerificationLink(user.getId());


      return ResponseEntity.ok(
              "Registration successful. Please verify your email."
      );

   }
   @GetMapping("/verify")
   public ResponseEntity<String> verifyEmail(@RequestParam String token) {
       Optional<VerificationToken> optionalToken =
               verificationTokenRepository.findByToken(token);

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
                 new UsernamePasswordAuthenticationToken(
                         req.email(), req.password()
                 )
         );
      } catch (BadCredentialsException | UsernameNotFoundException e) {
         return ResponseEntity
                 .status(HttpStatus.UNAUTHORIZED)
                 .body(Map.of("message", "Invalid email or password"));
      }

      UserEntity user = userRepo.findByEmail(req.email()).orElseThrow(() ->
              new ResponseStatusException(
                      HttpStatus.UNAUTHORIZED, "Invalid email or password"
              ));


      if (!user.isEnabled()) {
         return ResponseEntity
                 .status(HttpStatus.FORBIDDEN)
                 .body(Map.of(
                         "message", "Please verify your email before logging in."
                 ));
      }

      String accessToken = jwtService.generateToken(
              user.getEmail(),
              user.getName(),
              user.getRole().name()
      );

      String refreshToken = jwtService.generateRefreshToken(user);

      ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
              .httpOnly(true)
              .secure(true)
              .sameSite("None")
              .path("/")
              .maxAge(7 * 24 * 60 * 60)
              .build();

      response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

      return ResponseEntity.ok(
              new AuthResponse(
                      accessToken,
                      null,
                      new UserResponse(
                              user.getId(), user.getName(),
                              user.getEmail(), user.getRole()
                      )
              )
      );
   }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh Token Missing");
        }

        String email = jwtService.extractEmail(refreshToken);
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

        if (!jwtService.isRefreshTokenValid(refreshToken, userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Refresh Token");
        }

        UserEntity app = userRepo.findByEmail(email).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        String newAccessToken = jwtService.generateToken(
                app.getEmail(),
                app.getName(),
                app.getRole().name()
        );

        return ResponseEntity.ok(
                new AuthResponse(
                        newAccessToken,
                        null,
                        new UserResponse(
                                app.getId(), app.getName(),
                                app.getEmail(), app.getRole()
                        )
                )
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
