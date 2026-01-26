package LiveInterview.example.LiveInterview;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LiveInterviewApplication {

	public static void main(String[] args) {
		SpringApplication.run(LiveInterviewApplication.class, args);
	}

}
