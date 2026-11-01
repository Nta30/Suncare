package vn.suncare.common.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.json.JsonMapper;
import vn.suncare.common.exception.ConflictException;
import vn.suncare.common.exception.ErrorCode;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(HealthAndErrorHandlingTest.TestProbeController.class)
class HealthAndErrorHandlingTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JsonMapper jsonMapper;

	@Test
	void healthEndpointIsPublicAndReturnsUpAndCorrelationHeader() throws Exception {
		mockMvc.perform(get("/api/v1/health")
						.header(CorrelationIdFilter.HEADER_NAME, "corr-health-001"))
				.andExpect(status().isOk())
				.andExpect(header().string(CorrelationIdFilter.HEADER_NAME, "corr-health-001"))
				.andExpect(jsonPath("$.status").value("UP"))
				.andExpect(jsonPath("$.service").value("suncare-backend-test"))
				.andExpect(jsonPath("$.storageTimezone").value("UTC"))
				.andExpect(jsonPath("$.displayTimezone").value("Asia/Saigon"))
				.andExpect(jsonPath("$.timestamp").isNotEmpty());
	}

	@Test
	void unauthenticatedProtectedEndpointReturnsProblemDetail401() throws Exception {
		mockMvc.perform(get("/api/v1/test-probes/conflict")
						.header(CorrelationIdFilter.HEADER_NAME, "corr-unauth-401"))
				.andExpect(status().isUnauthorized())
				.andExpect(header().string(CorrelationIdFilter.HEADER_NAME, "corr-unauth-401"))
				.andExpect(jsonPath("$.status").value(401))
				.andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
				.andExpect(jsonPath("$.correlationId").value("corr-unauth-401"))
				.andExpect(jsonPath("$.detail").isNotEmpty());
	}

	@Test
	void businessConflictExceptionReturnsProblemDetail409() throws Exception {
		mockMvc.perform(get("/api/v1/test-probes/conflict")
						.with(user("tester")))
				.andExpect(status().isConflict())
				.andExpect(header().exists(CorrelationIdFilter.HEADER_NAME))
				.andExpect(jsonPath("$.status").value(409))
				.andExpect(jsonPath("$.code").value("IDEMPOTENCY_CONFLICT"))
				.andExpect(jsonPath("$.detail").value("Same idempotency key used with different payload."))
				.andExpect(jsonPath("$.correlationId").isNotEmpty());
	}

	@Test
	void validationFailureReturnsSanitizedFieldErrors() throws Exception {
		mockMvc.perform(post("/api/v1/test-probes/echo-money")
						.with(user("tester"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"code\":\"\",\"amount\":\"-100\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400))
				.andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
				.andExpect(jsonPath("$.fieldErrors").isArray())
				.andExpect(jsonPath("$.fieldErrors[0].field").value("amount"))
				.andExpect(jsonPath("$.fieldErrors[1].field").value("code"));
	}

	@Test
	void bigDecimalSerializesAsPlainDecimalStringAndRejectsFloatInput() throws Exception {
		String json = jsonMapper.writeValueAsString(Map.of("amount", new BigDecimal("150000")));
		assertThat(json).isEqualTo("{\"amount\":\"150000\"}");

		mockMvc.perform(post("/api/v1/test-probes/echo-money")
						.with(user("tester"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"code\":\"CLS-01\",\"amount\":\"150000\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.amount").value("150000"));

		mockMvc.perform(post("/api/v1/test-probes/echo-money")
						.with(user("tester"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"code\":\"CLS-01\",\"amount\":150000.5}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"));
	}

	@RestController
	@RequestMapping("/api/v1/test-probes")
	static class TestProbeController {

		record MoneyProbePayload(
				@NotBlank(message = "code is required") String code,
				@Positive(message = "amount must be positive") BigDecimal amount
		) {
		}

		@GetMapping("/conflict")
		public void triggerConflict() {
			throw new ConflictException(
					ErrorCode.IDEMPOTENCY_CONFLICT,
					"Same idempotency key used with different payload.");
		}

		@PostMapping("/echo-money")
		public MoneyProbePayload echoMoney(@Valid @RequestBody MoneyProbePayload payload) {
			return payload;
		}
	}
}

