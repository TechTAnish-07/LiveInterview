package LiveInterview.example.LiveInterview.Service;

import LiveInterview.example.LiveInterview.DTO.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class Judge0Service {

    private static final String BASE_URL = "https://ce.judge0.com";

    private final WebClient.Builder webClientBuilder;

    private WebClient client() {
        return webClientBuilder.baseUrl(BASE_URL).build();
    }

    public String submit(RunRequest runRequest) {

        int languageId = Judge0Language.fromName(runRequest.getLanguage());

        Judge0Request request = new Judge0Request(
                runRequest.getSourceCode(),
                languageId,
                runRequest.getStdin()
        );

        var response = client()
                .post()
                .uri("/submissions?base64_encoded=false&wait=false")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(TokenResponse.class)
                .block();

        if (response == null || response.getToken() == null) {
            throw new RuntimeException("Failed to submit code to Judge0");
        }

        return response.getToken();
    }


    public RunResponse getResult(String token) {

        Judge0Result result = client()
                .get()
                .uri("/submissions/{token}?base64_encoded=false", token)
                .retrieve()
                .bodyToMono(Judge0Result.class)
                .block();

        if (result == null || result.getStatus() == null) {
            throw new RuntimeException("Failed to fetch Judge0 result");
        }

        return mapToRunResponse(result);
    }


    private RunResponse mapToRunResponse(Judge0Result result) {
        return new RunResponse(
                result.getStdout(),
                result.getStderr(),
                result.getCompile_output(),
                result.getStatus().getDescription(),
                result.getTime() != null ? result.getTime() : 0.0,
                result.getMemory() != null ? result.getMemory() : 0.0
        );
    }


    private static class TokenResponse {
        private String token;
        public String getToken() {
            return token;
        }
        public void setToken(String token) {
            this.token = token;
        }
    }
}
