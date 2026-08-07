package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import LiveInterview.example.LiveInterview.Service.ResumeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeService resumeService;
    private final UserRepo userRepo;

    public ResumeController(ResumeService resumeService, UserRepo userRepo) {
        this.resumeService = resumeService;
        this.userRepo = userRepo;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            Principal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "PDF file is required"));
        }

        // Validate PDF type
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        boolean isPdfContentType = contentType != null && contentType.equalsIgnoreCase("application/pdf");
        boolean isPdfExtension = originalFilename != null && originalFilename.toLowerCase().endsWith(".pdf");

        if (!isPdfContentType && !isPdfExtension) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only PDF files are allowed"));
        }

        // Validate 5MB max size
        long maxSizeBytes = 5 * 1024 * 1024;
        if (file.getSize() > maxSizeBytes) {
            return ResponseEntity.badRequest().body(Map.of("message", "File size exceeds the 5MB limit"));
        }

        UserEntity user = userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        Long userId = user.getId();

        Map<String, Object> response = resumeService.uploadResume(file, userId);
        return ResponseEntity.ok(response);
    }
}
