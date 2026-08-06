package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.Entity.Resume;
import LiveInterview.example.LiveInterview.Repository.ResumeRepository;
import lombok.Data;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final WebClient webClient;
    private final String uploadDir;

    public ResumeService(
            ResumeRepository resumeRepository,
            WebClient.Builder webClientBuilder,
            @Value("${python.agent.service.url:http://localhost:8000}") String pythonAgentUrl,
            @Value("${file.upload-dir:uploads/resumes}") String uploadDir
    ) {
        this.resumeRepository = resumeRepository;
        this.webClient = webClientBuilder.baseUrl(pythonAgentUrl).build();
        this.uploadDir = uploadDir;
    }

    public Map<String, Object> uploadResume(MultipartFile file, Integer userId) {
        // 1. Save uploaded file to configured local directory
        String originalFilename = file.getOriginalFilename();
        String safeFilename = userId + "_" + UUID.randomUUID() + "_" + (originalFilename != null ? originalFilename : "resume.pdf");
        Path uploadPath = Paths.get(uploadDir);

        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path targetPath = uploadPath.resolve(safeFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // 2. Extract raw text using Apache PDFBox
            String rawText;
            try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                PDFTextStripper stripper = new PDFTextStripper();
                rawText = stripper.getText(document);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to extract text from PDF: " + e.getMessage());
            }

            // 3. Call Python agent service for text normalization
            NormalizeResponse normalizeResponse;
            try {
                normalizeResponse = webClient.post()
                        .uri("/resume/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(Map.of("rawText", rawText != null ? rawText : ""))
                        .retrieve()
                        .onStatus(HttpStatusCode::isError, res ->
                                res.bodyToMono(String.class)
                                        .map(body -> new ResponseStatusException(
                                                HttpStatus.BAD_GATEWAY,
                                                "Resume normalization failed on Python agent service: " + body
                                        ))
                        )
                        .bodyToMono(NormalizeResponse.class)
                        .block();
            } catch (ResponseStatusException e) {
                throw e;
            } catch (Exception e) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Failed to connect to Python agent service: " + e.getMessage()
                );
            }

            if (normalizeResponse == null || normalizeResponse.getCleanedText() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Python agent service returned empty normalized text"
                );
            }

            // 4. Save Resume entity
            Resume resume = new Resume();
            resume.setUserId(userId);
            resume.setFileUrl(targetPath.toString());
            resume.setExtractedText(normalizeResponse.getCleanedText());

            Resume savedResume = resumeRepository.save(resume);

            // 5. Return result
            return Map.of(
                    "id", savedResume.getId(),
                    "message", "Resume uploaded and normalized successfully",
                    "fileUrl", savedResume.getFileUrl()
            );

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store uploaded file: " + e.getMessage());
        }
    }

    @Data
    public static class NormalizeResponse {
        private String cleanedText;
    }
}
