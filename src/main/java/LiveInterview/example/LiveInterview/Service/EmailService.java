package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.Config.TokenUTIL;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Entity.VerificationToken;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import LiveInterview.example.LiveInterview.Repository.VerificationTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class EmailService {

    private final VerificationTokenRepository verificationTokenRepository;
    private final UserRepo userRepo;
    @Autowired
    public EmailService(VerificationTokenRepository verificationTokenRepository,
                        UserRepo userRepo
                        ) {
        this.verificationTokenRepository = verificationTokenRepository;
        this.userRepo = userRepo;
    }

    @Transactional
    public  void  verifyEmail(String token) {

        VerificationToken vt = verificationTokenRepository.findByToken(token)
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid or already used verification token")
                );

        if (vt.getExpiryDate().isBefore(LocalDateTime.now())) {
            verificationTokenRepository.delete(vt);
            throw new IllegalStateException("Verification token expired");
        }

        UserEntity user = vt.getUser();

        if (user.isEnabled()) {
            verificationTokenRepository.delete(vt);
            return; // already verified → idempotent
        }

        user.setEnabled(true);
        userRepo.save(user);

        verificationTokenRepository.delete(vt);
    }
  @Async
    public void sendVerificationLink(Long id) {
        UserEntity user = userRepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("Invalid user id"));
        verificationTokenRepository.deleteByUser(user);

      String token = TokenUTIL.generateToken();

        VerificationToken vt = new VerificationToken();
        vt.setToken(token);
        vt.setUser(user);
        vt.setExpiryDate(TokenUTIL.expiryTime());

        verificationTokenRepository.save(vt);
        String link = "local:8080" +"/auth/verify" + token;
    }
}
