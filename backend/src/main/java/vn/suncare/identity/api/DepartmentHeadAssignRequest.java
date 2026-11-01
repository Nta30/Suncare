package vn.suncare.identity.api;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record DepartmentHeadAssignRequest(
		@NotNull(message = "departmentId is required")
		Long departmentId,

		Instant validFrom,
		Instant validTo
) {
}

