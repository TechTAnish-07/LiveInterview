package LiveInterview.example.LiveInterview.Config;

import LiveInterview.example.LiveInterview.DTO.Role;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import static java.time.LocalTime.now;

@Configuration
public class AdminInitializer {

    @Bean
    public CommandLineRunner initAdmin(UserRepo repo, PasswordEncoder encoder) {
        return args -> {

            String adminEmail = "231161@iiitt.ac.in";

            if (repo.existsByEmail(adminEmail)) {
                System.out.println("✔ Admin already exists");
                return;
            }

            UserEntity admin = new UserEntity(
                    "Tanish",
                    adminEmail,
                    encoder.encode("9165849391"),
                    Role.Admin,
                    true
            );

            repo.save(admin);
            System.out.println("✔ Admin created");
        };
    }
}