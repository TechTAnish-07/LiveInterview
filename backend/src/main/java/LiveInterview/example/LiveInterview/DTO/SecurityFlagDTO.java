package LiveInterview.example.LiveInterview.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SecurityFlagDTO {

    private String type;
    private String message;
    private String userId;
    private String timestamp;
    private LocalDateTime serverTimestamp;
    private Map<String, Object> metadata;
    private String severity;
    public SecurityFlagDTO(String type, String message, String userId) {
        this.type = type;
        this.message = message;
        this.userId = userId;
        this.timestamp = LocalDateTime.now().toString();
    }
}