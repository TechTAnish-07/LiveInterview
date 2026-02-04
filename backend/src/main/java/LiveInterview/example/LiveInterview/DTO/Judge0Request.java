package LiveInterview.example.LiveInterview.DTO;
import lombok.Data;

@Data
public class Judge0Request {
    private String source_code;
    private int language_id;
    private String stdin;

    public Judge0Request(String code, int languageId, String input) {
        this.source_code = code;
        this.language_id = languageId;
        this.stdin = input;
    }
}
