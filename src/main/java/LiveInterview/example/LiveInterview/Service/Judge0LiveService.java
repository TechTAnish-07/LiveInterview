package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.DTO.Judge0Result;
import LiveInterview.example.LiveInterview.DTO.LiveRunMessage;
import LiveInterview.example.LiveInterview.DTO.RunRequest;
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

        messagingTemplate.convertAndSend(topic,
                new LiveRunMessage("STATUS", "Submitting code..."));

        String token = judge0Service.submit(request);

        String lastStdout = "";
        String lastStderr = "";

        while (true) {

            Judge0Result result = judge0Service.fetchRawResult(token);

            if (result.getStdout() != null &&
                    !result.getStdout().equals(lastStdout)) {

                String diff = result.getStdout().replace(lastStdout, "");
                lastStdout = result.getStdout();

                messagingTemplate.convertAndSend(topic,
                        new LiveRunMessage("STDOUT", diff));
            }

            if (result.getStderr() != null &&
                    !result.getStderr().equals(lastStderr)) {

                String diff = result.getStderr().replace(lastStderr, "");
                lastStderr = result.getStderr();

                messagingTemplate.convertAndSend(topic,
                        new LiveRunMessage("STDERR", diff));
            }

            int statusId = result.getStatus().getId();


            if (statusId > 2) {
                messagingTemplate.convertAndSend(topic,
                        new LiveRunMessage("DONE",
                                result.getStatus().getDescription()));
                break;
            }

            sleep(1000);
        }
    }

    private void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException ignored) {}
    }
}
