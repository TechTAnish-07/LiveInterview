package LiveInterview.example.LiveInterview.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * RefreshToken Entity:
 * Stores cryptographically hashed refresh tokens, token family lineage for reuse detection,
 * and lifecycle revocation flags.
 *
 * SECURITY:
 * - Never store raw refresh tokens in the database (stored as SHA-256 hash).
 * - Implements Token Family tracking for automatic compromise detection.
 */
@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_token_hash", columnList = "tokenHash", unique = true),
        @Index(name = "idx_family_id", columnList = "familyId"),
        @Index(name = "idx_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(nullable = false, length = 64)
    private String familyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private Instant expiryDate;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column(nullable = false)
    private boolean used = false;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public RefreshToken(String tokenHash, String familyId, UserEntity user, Instant expiryDate) {
        this.tokenHash = tokenHash;
        this.familyId = familyId;
        this.user = user;
        this.expiryDate = expiryDate;
        this.revoked = false;
        this.used = false;
        this.createdAt = Instant.now();
    }
}
