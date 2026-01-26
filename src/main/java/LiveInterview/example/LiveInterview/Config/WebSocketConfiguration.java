package LiveInterview.example.LiveInterview.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.socket.config.annotation.*;


@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfiguration implements WebSocketMessageBrokerConfigurer {

    private final ThreadPoolTaskExecutor inboundChannelExecutor;
    private final ThreadPoolTaskExecutor outboundChannelExecutor;
    private final TaskScheduler webSocketTaskScheduler;
    @Autowired
    public WebSocketConfiguration(ThreadPoolTaskExecutor inboundChannelExecutor,
                                  ThreadPoolTaskExecutor outboundChannelExecutor,
                                  @Qualifier("webSocketTaskScheduler") TaskScheduler webSocketTaskScheduler) {
        this.inboundChannelExecutor = inboundChannelExecutor;
        this.outboundChannelExecutor = outboundChannelExecutor;
         this.webSocketTaskScheduler = webSocketTaskScheduler;
    }
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.taskExecutor(inboundChannelExecutor);
    }

    @Override
    public void configureClientOutboundChannel(ChannelRegistration registration) {
        registration.taskExecutor(outboundChannelExecutor);
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        config.setApplicationDestinationPrefixes("/app");

        config.enableStompBrokerRelay("/topic", "/queue")
                .setRelayHost("localhost")
                .setRelayPort(61613)
                .setClientLogin("live_interview")
                .setClientPasscode("secret123")
                .setSystemLogin("live_interview")
                .setSystemPasscode("secret123")
                .setSystemHeartbeatSendInterval(6000)
                .setSystemHeartbeatReceiveInterval(6000)
                .setTaskScheduler(webSocketTaskScheduler);
    }


}
