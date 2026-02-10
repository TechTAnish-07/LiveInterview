package LiveInterview.example.LiveInterview.DTO;

import lombok.Data;

@Data
public class SignalMessage {
    private SignalType type;
    private String from;
    private Object payload;
}
