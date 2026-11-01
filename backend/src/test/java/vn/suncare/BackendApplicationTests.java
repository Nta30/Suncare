package vn.suncare;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class BackendApplicationTests {

	@Autowired
	private Clock clock;

	@Test
	void contextLoadsWithUtcClock() {
		assertThat(clock).isNotNull();
		assertThat(clock.getZone().getId()).isEqualTo("Z");
	}

}
