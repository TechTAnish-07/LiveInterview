package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.Entity.RefreshToken;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.jwt.refresh-expiration-days:7}")
    private long refreshExpirationDays;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * Generates a new refresh token for a user upon fresh login (starts a new token
     * family).
     */
    @Transactional
    public String createRefreshToken(UserEntity user) {
        String rawToken = generateSecureRandomToken();
        String tokenHash = hashToken(rawToken);
        String familyId = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plusSeconds(refreshExpirationDays * 24 * 3600);

        RefreshToken refreshToken = new RefreshToken(tokenHash, familyId, user, expiryDate);
        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }

    /**
     * Rotates a refresh token:
     * 1. Validates token hash and expiry.
     * 2. Detects token reuse (if token was already used or revoked, revokes entire
     * family).
     * 3. Marks old token as used and issues a new token in the same family.
     *
     * @return RotatedTokenResult containing new raw token and associated UserEntity
     */
    @Transactional
    public RotatedTokenResult rotateRefreshToken(String rawOldToken) {
        String tokenHash = hashToken(rawOldToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElse(null);

        // 1. Token doesn't exist
        if (token == null) {
            throw new InvalidRefreshTokenException("Invalid or unrecognized refresh token.");
        }

        // 2. Token reuse / replay detection: If token was already used or revoked,
        // breach suspected!
        if (token.isUsed() || token.isRevoked()) {
            // Compromise detected: revoke entire token family immediately
            refreshTokenRepository.revokeAllInFamily(token.getFamilyId());
            throw new CompromisedTokenException("Token reuse detected. All sessions in this family have been revoked.");
        }

        // 3. Expiration check
        if (token.getExpiryDate().isBefore(Instant.now())) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new InvalidRefreshTokenException("Refresh token has expired.");
        }

        // 4. Mark old token as used
        token.setUsed(true);
        refreshTokenRepository.save(token);

        // 5. Issue new refresh token linked to the SAME family
        String newRawToken = generateSecureRandomToken();
        String newTokenHash = hashToken(newRawToken);
        Instant newExpiryDate = Instant.now().plusSeconds(refreshExpirationDays * 24 * 3600);

        RefreshToken newToken = new RefreshToken(newTokenHash, token.getFamilyId(), token.getUser(), newExpiryDate);
        refreshTokenRepository.save(newToken);

        return new RotatedTokenResult(newRawToken, token.getUser());
    }

    /**
     * Revokes a specific refresh token upon logout.
     */
    @Transactional
    public void revokeRefreshToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        String tokenHash = hashToken(rawToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    /**
     * Revokes all active refresh tokens for a user (e.g. password reset / admin
     * ban).
     */
    @Transactional
    public void revokeAllUserTokens(UserEntity user) {
        refreshTokenRepository.revokeAllForUser(user);
    }

    private String generateSecureRandomToken() {
        byte[] bytes = new byte[64];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    public record RotatedTokenResult(String newRefreshToken, UserEntity user) {
    }

    public static class InvalidRefreshTokenException extends RuntimeException {
        public InvalidRefreshTokenException(String message) {
            super(message);
        }
    }

    public static class CompromisedTokenException extends RuntimeException {
        public CompromisedTokenException(String message) {
            super(message);
        }
    }
}
