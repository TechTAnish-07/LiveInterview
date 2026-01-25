package LiveInterview.example.LiveInterview.DTO;

public record AuthResponse(
        String token,

        String refreshToken,
        UserResponse user
) {
}
