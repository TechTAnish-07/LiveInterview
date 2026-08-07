package LiveInterview.example.LiveInterview.Config;

import io.livekit.server.RoomServiceClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LiveKitConfig {

    @Value("${livekit.api.key}")
    private String apiKey;

    @Value("${livekit.api.secret}")
    private String apiSecret;

    @Value("${livekit.url}")
    private String livekitUrl;

    @Bean
    public RoomServiceClient roomServiceClient() {
        String httpUrl = livekitUrl;
        if (httpUrl.startsWith("ws://")) {
            httpUrl = httpUrl.replace("ws://", "http://");
        } else if (httpUrl.startsWith("wss://")) {
            httpUrl = httpUrl.replace("wss://", "https://");
        }
        return RoomServiceClient.createClient(httpUrl, apiKey, apiSecret);
    }
}
