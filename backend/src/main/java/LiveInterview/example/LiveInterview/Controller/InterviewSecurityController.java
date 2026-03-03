package LiveInterview.example.LiveInterview.Controller;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;
import LiveInterview.example.LiveInterview.DTO.SecurityFlagDTO;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
public class InterviewSecurityController {

     private final Map<String, List<SecurityFlagDTO >> interviewFlags = new HashMap<>();


    @MessageMapping("/interview/{interviewId}/security")
    @SendTo("/topic/interview/{interviewId}/security")
    public SecurityFlagDTO handleSecurityFlag(
            @DestinationVariable String interviewId,
            SecurityFlagDTO flag) {


        flag.setServerTimestamp(LocalDateTime.now());


        interviewFlags.computeIfAbsent(interviewId, k -> new java.util.ArrayList<>()).add(flag);


        System.out.println(String.format(
                "[SECURITY FLAG] Interview: %s | Type: %s | User: %s | Message: %s",
                interviewId, flag.getType(), flag.getUserId(), flag.getMessage()
        ));


        return flag;
    }


    public List<SecurityFlagDTO> getInterviewFlags(String interviewId) {
        return interviewFlags.getOrDefault(interviewId, new java.util.ArrayList<>());
    }


    public void clearInterviewFlags(String interviewId) {
        interviewFlags.remove(interviewId);
    }
}