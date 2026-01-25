package LiveInterview.example.LiveInterview.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/HR")
public class InterviewCreationController {

    @PostMapping("")
    public ResponseEntity<?> createInterview() {

        return ResponseEntity.ok().build();
    }
}
