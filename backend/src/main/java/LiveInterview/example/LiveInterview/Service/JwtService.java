package LiveInterview.example.LiveInterview.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {


    @Value("${JWT_SECRET}")
    private String secret;

    @Value("${JWT_EXPIRATION:900000}") // Default 15 minutes (900,000 ms)
    private long expirationMs;

    private Key signingKey;

    @PostConstruct
    public void init() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("JWT_SECRET must be at least 256 bits (32 bytes) for HS256");
        }
        signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generates a short-lived access token with role and identity claims.
     */
    public String generateToken(String email, String name, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("displayName", name);
        claims.put("role", role);
        claims.put("type", "ACCESS");

        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMs))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Single-pass cryptographic verification and claims extraction.
     * Parses the JWT, verifies HMAC-SHA256 signature, and checks expiration in a single operation.
     *
     * @param token Raw Bearer JWT string
     * @return Validated Claims payload
     * @throws JwtException if signature is invalid, expired, malformed, or unsupported
     */
    public Claims parseAndValidateToken(String token) throws JwtException {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractEmail(String token) {
        return parseAndValidateToken(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails user) {
        try {
            Claims claims = parseAndValidateToken(token);
            String email = claims.getSubject();
            String tokenType = claims.get("type", String.class);
            return "ACCESS".equals(tokenType) && email != null && email.equals(user.getUsername());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
