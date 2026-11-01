package vn.suncare.identity.api;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import vn.suncare.security.AccountStatus;

public record AccountStatusUpdateRequest(
		@NotNull(message = "status is required")
		AccountStatus status,

		@Size(max = 500)
		String reason
) {
}

