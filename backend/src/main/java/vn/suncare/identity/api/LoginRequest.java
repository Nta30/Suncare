package vn.suncare.identity.api;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
		@NotBlank(message = "loginName is required")
		String loginName,

		@NotBlank(message = "password is required")
		String password
) {
}

