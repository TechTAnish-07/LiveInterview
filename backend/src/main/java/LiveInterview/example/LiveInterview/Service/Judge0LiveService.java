package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.DTO.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Judge0LiveService {

    private final Judge0Service judge0Service;
    private final SimpMessagingTemplate messagingTemplate;

    @Async
    public void runWithLiveOutput(Long interviewId, RunRequest request) {

        String topic = "/topic/interview/" + interviewId + "/run-output";

        try {

            messagingTemplate.convertAndSend(topic,
                    new LiveRunMessage("STATUS", "Submitting code..."));

            CodeExecutionRequest execRequest =
                    new CodeExecutionRequest(
                            request.getSourceCode(),
                            request.getLanguage(),
                            request.getStdin()
                    );

            String token = judge0Service.submit(execRequest);

            messagingTemplate.convertAndSend(topic,
                    new LiveRunMessage("STATUS", "Running code..."));

            Judge0Result result = judge0Service.waitForCompletion(token);

            // Send stdout
            if (result.getStdout() != null) {
                messagingTemplate.convertAndSend(topic,
                        new LiveRunMessage("STDOUT", result.getStdout()));
            }

            if (result.getStderr() != null) {
                messagingTemplate.convertAndSend(topic,
                        new LiveRunMessage("STDERR", result.getStderr()));
            }


            if (result.getCompile_output() != null) {
                messagingTemplate.convertAndSend(topic,
                        new LiveRunMessage("COMPILE_ERROR", result.getCompile_output()));
            }

            String statusDescription =
                    result.getStatus() != null ?
                            result.getStatus().getDescription() :
                            "Unknown";

            messagingTemplate.convertAndSend(topic,
                    new LiveRunMessage("DONE", statusDescription));

        } catch (Exception e) {

            e.printStackTrace();

            messagingTemplate.convertAndSend(topic,
                    new LiveRunMessage("ERROR",
                            "Execution failed: " + e.getMessage()));
        }
    }

}
