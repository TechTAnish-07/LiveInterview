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
            @Value("${resume.normalization.service.url:http://localhost:8000}") String normalizationServiceUrl,
            @Value("${file.upload-dir:uploads/resumes}") String uploadDir
    ) {
        this.resumeRepository = resumeRepository;
        this.webClient = webClientBuilder.baseUrl(normalizationServiceUrl).build();
        this.uploadDir = uploadDir;
    }

    public Map<String, Object> uploadResume(MultipartFile file, Long userId) {
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

            // 3. Call Python agent service for text normalization (with graceful fallback)
            String finalText = rawText;
            try {
                NormalizeResponse normalizeResponse = webClient.post()
                        .uri("/resume/normalize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(Map.of("rawText", rawText != null ? rawText : ""))
                        .retrieve()
                        .bodyToMono(NormalizeResponse.class)
                        .block();

                if (normalizeResponse != null && normalizeResponse.getCleanedText() != null && !normalizeResponse.getCleanedText().isBlank()) {
                    finalText = normalizeResponse.getCleanedText();
                }
            } catch (Exception e) {
                // Fallback to raw extracted text if normalization microservice is not reachable
            }

            // 4. Save Resume entity
            Resume resume = new Resume();
            resume.setUserId(userId);
            resume.setFileUrl(targetPath.toString());
            resume.setExtractedText(finalText);

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

    public Map<String, Object> getLatestResume(Long userId) {
        java.util.Optional<Resume> resumeOpt = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(userId);
        if (resumeOpt.isEmpty()) {
            return null;
        }
        Resume resume = resumeOpt.get();
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("resumeId", resume.getId());
        result.put("fileUrl", resume.getFileUrl());
        result.put("uploadedAt", resume.getUploadedAt());
        return result;
    }

    @Data
    public static class NormalizeResponse {
        private String cleanedText;
    }
}
