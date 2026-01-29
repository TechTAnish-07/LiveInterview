package LiveInterview.example.LiveInterview.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RunResponse {
    private String stdout;
    private String stderr;
    private String compileOutput;
    private String status;
    private double time;
    private double memory;
}

