package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.*;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.InterviewRepository;
import LiveInterview.example.LiveInterview.Repository.PracticeQuestionRepository;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final UserRepo userRepo;
    private final PracticeQuestionRepository questionRepository;
    private final InterviewRepository interviewRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody AdminCreateUserRequest req) {
        if (req.email() == null || req.email().isBlank() || req.password() == null || req.password().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
        }

        if (userRepo.existsByEmail(req.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists"));
        }

        UserEntity user = new UserEntity();
        user.setName(req.name() != null && !req.name().isBlank() ? req.name() : req.email().split("@")[0]);
        user.setEmail(req.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setRole(req.role() != null ? req.role() : Role.CANDIDATE);
        user.setEnabled(true);
        user.setCreatedDate(LocalDateTime.now());

        UserEntity saved = userRepo.save(user);
        log.info("Admin created new user with email: {} and role: {}", saved.getEmail(), saved.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new UserResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole())
        );
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsers(@RequestParam(required = false) Role role) {
        List<UserEntity> users = (role != null) ? userRepo.findByRole(role) : userRepo.findAll();
        List<UserResponse> responses = users.stream()
                .map(u -> new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole()))
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        long totalQuestions = questionRepository.count();
        long totalUsers = userRepo.count();

        Map<String, Long> usersByRole = new HashMap<>();
        for (Role role : Role.values()) {
            usersByRole.put(role.name(), userRepo.countByRole(role));
        }

        long totalInterviews = interviewRepository.count();
        Map<String, Long> interviewsByStatus = new HashMap<>();
        for (InterviewStatus status : InterviewStatus.values()) {
            interviewsByStatus.put(status.name(), interviewRepository.countByStatus(status));
        }

        AdminStatsResponse response = AdminStatsResponse.builder()
                .totalQuestions(totalQuestions)
                .totalUsers(totalUsers)
                .usersByRole(usersByRole)
                .totalInterviews(totalInterviews)
                .interviewsByStatus(interviewsByStatus)
                .build();

        return ResponseEntity.ok(response);
    }
}
