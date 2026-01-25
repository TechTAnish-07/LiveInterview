package LiveInterview.example.LiveInterview.Service;

import io.jsonwebtoken.Claims;
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

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    private Key signingKey;

    @PostConstruct
    public void init() {
        signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // --------------------------
    // ACCESS TOKEN (15 min)
    // --------------------------
    public String generateToken(String email, String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("displayName", username);
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email) // subject = email
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(UserDetails user) {
        return Jwts.builder()
                .setSubject(user.getUsername()) // email
                .setExpiration(new Date(System.currentTimeMillis() + (7 * 24 * 60 * 60 * 1000)))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }



    public boolean isTokenValid(String token , UserDetails user) {
        String email = extractEmail(token);

        return email.equals(user.getUsername()) && !isExpired(token);
    }
    public boolean isRefreshTokenValid(String token, UserDetails user) {
        String email = extractEmail(token);
        return email.equals(user.getUsername()) && !isExpired(token);
    }

    // --------------------------
    // Extract Information
    // --------------------------
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    // --------------------------
    // Parse Claims
    // --------------------------
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
