package vn.suncare.common.api;

import java.time.Clock;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/health", produces = MediaType.APPLICATION_JSON_VALUE)
public class HealthController {

	private final Clock clock;
	private final String serviceName;
	private final String displayTimezone;

	public HealthController(
			Clock clock,
			@Value("${spring.application.name:suncare-backend}") String serviceName,
			@Value("${suncare.timezone.display:Asia/Saigon}") String displayTimezone) {
		this.clock = clock;
		this.serviceName = serviceName;
		this.displayTimezone = displayTimezone;
	}

	@GetMapping
	public HealthResponse getHealth() {
		return new HealthResponse(
				"UP",
				serviceName,
				"UTC",
				displayTimezone,
				Instant.now(clock)
		);
	}
}

