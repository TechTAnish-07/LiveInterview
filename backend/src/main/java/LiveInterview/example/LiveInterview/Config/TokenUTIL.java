package LiveInterview.example.LiveInterview.Config;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class TokenUTIL {
    public static String generateToken() {
        return UUID.randomUUID().toString();
    }

    public static LocalDateTime expiryTime() {
        return LocalDateTime.now().plusMinutes(30);
    }
}