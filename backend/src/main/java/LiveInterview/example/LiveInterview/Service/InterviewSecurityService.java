package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.DTO.SecurityFlagDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class InterviewSecurityService {

    private final Map<String, List<SecurityFlagDTO>> interviewFlags = new ConcurrentHashMap<>();

    public SecurityFlagDTO recordFlag(String interviewId, SecurityFlagDTO flag, Principal principal) {
        if (flag == null) {
            return null;
        }

        // Enforce authenticated identity - prevent client-side userId spoofing
        if (principal != null) {
            flag.setUserId(principal.getName());
        } else if (flag.getUserId() == null || flag.getUserId().isBlank()) {
            flag.setUserId("ANONYMOUS");
        }
        flag.setServerTimestamp(LocalDateTime.now());

        // Thread-safe append
        interviewFlags.computeIfAbsent(interviewId, k -> new CopyOnWriteArrayList<>()).add(flag);

        log.warn("[SECURITY FLAG] Interview: {} | Type: {} | User: {} | Message: {}",
                interviewId, flag.getType(), flag.getUserId(), flag.getMessage());

        return flag;
    }

    public SecurityFlagDTO recordFlag(String interviewId, SecurityFlagDTO flag) {
        return recordFlag(interviewId, flag, null);
    }

    public List<SecurityFlagDTO> getFlags(String interviewId) {
        if (interviewId == null) {
            return Collections.emptyList();
        }
        List<SecurityFlagDTO> flags = interviewFlags.get(interviewId);
        return flags != null ? new ArrayList<>(flags) : Collections.emptyList();
    }

    public void clearFlags(String interviewId) {
        if (interviewId != null) {
            interviewFlags.remove(interviewId);
        }
    }
}
