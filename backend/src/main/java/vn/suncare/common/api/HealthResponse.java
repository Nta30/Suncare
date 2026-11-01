package vn.suncare.common.api;

import java.time.Instant;

public record HealthResponse(
		String status,
		String service,
		String storageTimezone,
		String displayTimezone,
		Instant timestamp
) {
}

