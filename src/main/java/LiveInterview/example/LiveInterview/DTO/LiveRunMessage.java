package LiveInterview.example.LiveInterview.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LiveRunMessage {
    private String type;     // STATUS | STDOUT | STDERR | DONE
    private String payload;
}

