package LiveInterview.example.LiveInterview.Service;


import org.springframework.stereotype.Service;


@Service
public interface EmailService {

    void sendVerificationLink(Long userId);
}
