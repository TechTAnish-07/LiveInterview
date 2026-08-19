package LiveInterview.example.LiveInterview.dsa.service;

import LiveInterview.example.LiveInterview.dsa.entity.DsaDifficulty;
import LiveInterview.example.LiveInterview.dsa.entity.DsaQuestion;
import LiveInterview.example.LiveInterview.dsa.entity.DsaSource;
import LiveInterview.example.LiveInterview.dsa.repository.DsaQuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DsaCsvImportService {

    private final DsaQuestionRepository dsaQuestionRepository;
    private final ResourceLoader resourceLoader;

    // Standard topic order taxonomy
    private static final List<String> TOPIC_ORDER = List.of(
            "Arrays",
            "Matrix",
            "Strings",
            "Searching & Sorting",
            "Linked List",
            "Binary Trees",
            "Binary Search Trees",
            "Greedy",
            "Backtracking",
            "Stacks & Queues",
            "Heap",
            "Graph",
            "Trie",
            "Dynamic Programming",
            "Bit Manipulation"
    );

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        try {
            long count = dsaQuestionRepository.count();
            if (count == 0) {
                log.info("No DSA questions found in database. Seeding from dsa_questions.csv...");
                importFromClasspathResource("classpath:data/dsa_questions.csv");
            } else {
                log.info("Found {} existing DSA questions in database. Syncing latest seed...", count);
                importFromClasspathResource("classpath:data/dsa_questions.csv");
            }
        } catch (Exception e) {
            log.error("Failed to seed DSA questions on startup: {}", e.getMessage(), e);
        }
    }

    public int importFromClasspathResource(String resourcePath) {
        try {
            Resource resource = resourceLoader.getResource(resourcePath);
            if (!resource.exists()) {
                log.warn("Resource not found at {}", resourcePath);
                return 0;
            }
            try (InputStream is = resource.getInputStream()) {
                return importCsv(is);
            }
        } catch (Exception e) {
            log.error("Error reading resource {}: {}", resourcePath, e.getMessage(), e);
            return 0;
        }
    }

    @Transactional
    public int importCsv(InputStream inputStream) {
        int importedCount = 0;
        int updatedCount = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                return 0;
            }

            // Detect column indices from header
            String[] headers = parseCsvLine(headerLine);
            int topicIdx = -1;
            int nameIdx = -1;
            int linkIdx = -1;
            int diffIdx = -1;

            for (int i = 0; i < headers.length; i++) {
                String h = headers[i].trim().toLowerCase().replaceAll("[_\\s-]", "");
                if (h.equals("topic")) topicIdx = i;
                else if (h.equals("questionname") || h.equals("problem") || h.equals("title") || h.equals("name")) nameIdx = i;
                else if (h.equals("link") || h.equals("url")) linkIdx = i;
                else if (h.equals("difficulty") || h.equals("diff") || h.equals("level")) diffIdx = i;
            }

            // Fallback default index positions if headers are standard topic,question_name,link,difficulty
            if (topicIdx == -1) topicIdx = 0;
            if (nameIdx == -1) nameIdx = 1;
            if (linkIdx == -1) linkIdx = 2;
            if (diffIdx == -1) diffIdx = 3;

            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }

                String[] cols = parseCsvLine(line);
                if (cols.length <= Math.max(topicIdx, Math.max(nameIdx, linkIdx))) {
                    continue;
                }

                String topic = cols[topicIdx].trim();
                String title = cols[nameIdx].trim();
                String link = cols[linkIdx].trim();
                String diffStr = cols.length > diffIdx ? cols[diffIdx].trim() : "Medium";

                if (topic.isEmpty() || title.isEmpty()) {
                    continue;
                }

                DsaSource source = inferSource(link);
                DsaDifficulty difficulty = parseDifficulty(diffStr);
                int topicOrder = getTopicOrder(topic);

                Optional<DsaQuestion> existingOpt = dsaQuestionRepository.findByTopicAndTitle(topic, title);
                if (existingOpt.isPresent()) {
                    DsaQuestion existing = existingOpt.get();
                    existing.setLink(link);
                    existing.setSource(source);
                    existing.setDifficulty(difficulty);
                    existing.setTopicOrder(topicOrder);
                    dsaQuestionRepository.save(existing);
                    updatedCount++;
                } else {
                    DsaQuestion newQuestion = DsaQuestion.builder()
                            .topic(topic)
                            .title(title)
                            .link(link)
                            .source(source)
                            .difficulty(difficulty)
                            .topicOrder(topicOrder)
                            .build();
                    dsaQuestionRepository.save(newQuestion);
                    importedCount++;
                }
            }
            log.info("DSA CSV import complete: {} added, {} updated.", importedCount, updatedCount);
        } catch (Exception e) {
            log.error("Failed to parse and import DSA CSV: {}", e.getMessage(), e);
            throw new RuntimeException("Error importing CSV: " + e.getMessage(), e);
        }

        return importedCount + updatedCount;
    }

    public DsaSource inferSource(String link) {
        if (link == null) return DsaSource.OTHER;
        String lower = link.toLowerCase();
        if (lower.contains("leetcode.com")) {
            return DsaSource.LEETCODE;
        } else if (lower.contains("geeksforgeeks.org") || lower.contains("gfg")) {
            return DsaSource.GFG;
        }
        return DsaSource.OTHER;
    }

    public DsaDifficulty parseDifficulty(String diffStr) {
        if (diffStr == null) return DsaDifficulty.MEDIUM;
        String trimmed = diffStr.trim().toUpperCase();
        try {
            return DsaDifficulty.valueOf(trimmed);
        } catch (IllegalArgumentException e) {
            if (trimmed.startsWith("E")) return DsaDifficulty.EASY;
            if (trimmed.startsWith("H")) return DsaDifficulty.HARD;
            return DsaDifficulty.MEDIUM;
        }
    }

    public int getTopicOrder(String topic) {
        for (int i = 0; i < TOPIC_ORDER.size(); i++) {
            if (TOPIC_ORDER.get(i).equalsIgnoreCase(topic.trim())) {
                return i + 1;
            }
        }
        return TOPIC_ORDER.size() + 1;
    }

    private String[] parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '\"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(sb.toString().trim());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        result.add(sb.toString().trim());

        return result.toArray(new String[0]);
    }
}
