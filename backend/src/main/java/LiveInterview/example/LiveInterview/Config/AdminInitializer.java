package LiveInterview.example.LiveInterview.Config;

import LiveInterview.example.LiveInterview.DTO.Role;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:patidartanish31@gmail.com}")
    private String adminEmail;

    @Value("${app.admin.password:12345678}")
    private String adminPassword;

    @Value("${app.admin.name:Admin}")
    private String adminName;


    @Override
    public void run(String... args) {
        if (userRepo.existsByEmail(adminEmail)) {
            log.info("Admin user already exists with email: {}. Skipping creation.", adminEmail);
            return;
        }

        UserEntity admin = new UserEntity();
        admin.setName(adminName);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        admin.setCreatedDate(LocalDateTime.now());

        userRepo.save(admin);
        log.info("Admin user initialized successfully with email: {}", adminEmail);
    }
}
