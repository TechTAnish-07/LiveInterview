package LiveInterview.example.LiveInterview.Controller;
import LiveInterview.example.LiveInterview.DTO.AuthResponse;
import LiveInterview.example.LiveInterview.DTO.LoginReq;
import LiveInterview.example.LiveInterview.DTO.RegisterRequest;
import LiveInterview.example.LiveInterview.DTO.UserResponse;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import LiveInterview.example.LiveInterview.Service.CustomUserDetailsService;
import LiveInterview.example.LiveInterview.Service.EmailService;
import LiveInterview.example.LiveInterview.Service.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {
   private final UserRepo userRepo;
   private final AuthenticationManager authManager;
   private final JwtService jwtService;
   private final PasswordEncoder passwordEncoder;
   private final CustomUserDetailsService customUserDetailsService;
   private final EmailService emailService;

   @Autowired
   public AuthController(UserRepo userRepo, AuthenticationManager authManager,
                         JwtService jwtService ,
                         PasswordEncoder passwordEncoder,
                         CustomUserDetailsService customUserDetailsService,
                         EmailService emailService
                         ) {
      this.userRepo = userRepo;
      this.authManager = authManager;
      this.jwtService = jwtService;
      this.passwordEncoder = passwordEncoder;
      this.customUserDetailsService = customUserDetailsService;
      this.emailService = emailService;
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
      user.setRole(req.role());
      user.setPassword(passwordEncoder.encode(req.password()));

      user.setEnabled(false);

      customUserDetailsService.save(user);
     emailService.sendVerificationLink(user.getId());


      return ResponseEntity.ok(
              "Registration successful. Please verify your email."
      );

   }
   @GetMapping("/verify")
   public ResponseEntity<String> verifyEmail(@RequestParam String token) {
       emailService.verifyEmail(token);
       return ResponseEntity.ok(" " );
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
              user.getUsername(),
              user.getRole().name()
      );

      String refreshToken = jwtService.generateRefreshToken(user);

      Cookie cookie = new Cookie("refreshToken", refreshToken);
      cookie.setHttpOnly(true);
      cookie.setSecure(true);
      cookie.setPath("/auth/refresh-token");
      cookie.setMaxAge(7 * 24 * 60 * 60);

      response.addCookie(cookie);

      return ResponseEntity.ok(
              new AuthResponse(
                      accessToken,
                      refreshToken,
                      new UserResponse(
                              user.getId(),user.getName(),
                              user.getEmail(), user.getRole().name()
                      )
              )
      );
   }
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {

        String refreshToken = null;

        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if (c.getName().equals("refreshToken")) {
                    refreshToken = c.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null)
            return ResponseEntity.status(401).body("Refresh Token Missing");

        String email = jwtService.extractEmail(refreshToken);

        UserDetails user = customUserDetailsService.loadUserByUsername(email);

        if (!jwtService.isRefreshTokenValid(refreshToken, user))
            return ResponseEntity.status(401).body("Invalid Refresh Token");

        UserEntity app = userRepo.findByEmail(email).orElseThrow();

        String newAccessToken = jwtService.generateToken(
                app.getEmail(),
                app.getUsername(),
                app.getRole().name()
        );

        return ResponseEntity.ok(
                new AuthResponse(
                        newAccessToken,
                        refreshToken,
                        new UserResponse(
                                app.getId(),app.getUsername(),
                                app.getEmail(), app.getRole().name()
                        )
                )
        );
    }



}
