package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.Config.TokenUTIL;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Entity.VerificationToken;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import LiveInterview.example.LiveInterview.Repository.VerificationTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BrevoEmailService implements  EmailService{
    @Value("${BREVO_API_KEY}")
    private String apiKey;

    @Value("${BACKEND_URL}")
    private String backendUrl;


    private final RestTemplate restTemplate = new RestTemplate();
    private final UserRepo   userRepo;
    private final VerificationTokenRepository tokenRepo;

    public  BrevoEmailService(UserRepo userRepo,
                                  VerificationTokenRepository tokenRepo) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
    }

    @Override
    @Async
    @Transactional
    public void sendVerificationLink(Long userId) {

        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        tokenRepo.deleteByUser(user);

        String token = TokenUTIL.generateToken();

        VerificationToken vt = new VerificationToken();
        vt.setToken(token);
        vt.setUser(user);
        vt.setExpiryDate(TokenUTIL.expiryTime());
        tokenRepo.save(vt);

        String link = backendUrl + "/auth/verify?token=" + token;

        sendViaBrevo(user.getEmail(), user.getUsername(), link);
    }

    private void sendViaBrevo(String toEmail, String username, String link) {

        String url = "https://api.brevo.com/v3/smtp/email";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("api-key", apiKey);

        Map<String, Object> body = new HashMap<>();

        body.put("sender", Map.of(
                "name", "LiveInterview",
                "email", "patidartanish31@gmail.com"
        ));

        body.put("to", List.of(
                Map.of(
                        "email", toEmail,
                        "name", username
                )
        ));

        body.put("subject", "Verify your email –Live Interview🚗");

        body.put("htmlContent",
                "<p>Hi " + username + " 👋</p>" +
                        "<p>Welcome to <b>Live Interview</b>.</p>" +
                        "<p>Please verify your email by clicking below:</p>" +
                        "<p><a href=\"" + link + "\">Verify Email</a></p>" +
                        "<p><small>This link expires in 30 minutes.</small></p>"
        );

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response =
                    restTemplate.postForEntity(url, request, String.class);

            System.out.println("✅ Brevo response status: " + response.getStatusCode());
            System.out.println("✅ Email sent to: " + toEmail);

        } catch (HttpClientErrorException e) {
            System.err.println("❌ Brevo rejected request");
            System.err.println(e.getResponseBodyAsString());
            throw e;

        } catch (Exception e) {
            System.err.println("❌ Email sending failed");
            e.printStackTrace();
            throw e;
        }
    }


}
