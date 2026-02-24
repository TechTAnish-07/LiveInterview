package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.DTO.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class Judge0Service {

    private final WebClient webClient;

    public Judge0Service(WebClient.Builder builder) {
        this.webClient = builder
                .baseUrl("https://ce.judge0.com")
                .build();
    }


    public String submit(CodeExecutionRequest runRequest) {

        int languageId = Judge0Language.fromName(runRequest.getLanguage());

        Judge0Request request = new Judge0Request(
                runRequest.getSourceCode(),
                languageId,
                runRequest.getStdin()
        );

        TokenResponse response = webClient
                .post()
                .uri(uriBuilder -> uriBuilder
                        .path("/submissions")
                        .queryParam("base64_encoded", false)
                        .queryParam("wait", false)
                        .build())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, res ->
                        res.bodyToMono(String.class)
                                .map(body -> new RuntimeException(
                                        "Judge0 submit error: " + body)))
                .bodyToMono(TokenResponse.class)
                .block();

        if (response == null || response.getToken() == null) {
            throw new RuntimeException("Failed to submit code to Judge0");
        }

        return response.getToken();
    }


    public RunResponse getResult(String token) throws InterruptedException {

        Judge0Result result = waitForCompletion(token);
        return mapToRunResponse(result);
    }


    public Judge0Result getRawResult(String token) {

        Judge0Result result = webClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/submissions/{token}")
                        .queryParam("base64_encoded", false)
                        .build(token))
                .retrieve()
                .bodyToMono(Judge0Result.class)
                .block();

        if (result == null) {
            throw new RuntimeException("Judge0 returned null response");
        }

        return result;
    }

    public Judge0Result waitForCompletion(String token) throws InterruptedException {

        int maxAttempts = 25; // ~20 seconds
        int attempts = 0;

        while (attempts < maxAttempts) {

            attempts++;

            Judge0Result result = getRawResult(token);

            if (result.getStatus() == null ||
                    result.getStatus().getId() == null) {

                Thread.sleep(800);
                continue;
            }

            if (result.getStatus().getId() > 2) {
                return result;
            }

            Thread.sleep(800);
        }

        throw new RuntimeException("Judge0 execution timeout");
    }


    public RunResponse mapToRunResponse(Judge0Result result) {

        if (result.getStatus() == null) {
            throw new RuntimeException("Invalid Judge0 status");
        }

        return new RunResponse(
                result.getStdout(),
                result.getStderr(),
                result.getCompile_output(),
                result.getStatus().getDescription(),
                result.getTime() != null ? result.getTime() : 0.0,
                result.getMemory() != null ? result.getMemory() : 0.0
        );
    }


    @Setter
    @Getter
    private static class TokenResponse {
        private String token;
    }
}