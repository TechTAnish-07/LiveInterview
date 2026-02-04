package LiveInterview.example.LiveInterview.DTO;

import lombok.Data;

@Data
public class Judge0Result {
    private String stdout;
    private String stderr;
    private String compile_output;
    private Judge0Status status;
    private Double time;
    private Double memory;


}