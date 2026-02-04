package LiveInterview.example.LiveInterview.DTO;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role
) {
}
