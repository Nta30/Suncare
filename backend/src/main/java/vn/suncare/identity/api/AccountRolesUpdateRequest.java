package vn.suncare.identity.api;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.Set;
import vn.suncare.security.RoleCode;

public record AccountRolesUpdateRequest(
		@NotEmpty(message = "roles must not be empty")
		Set<RoleCode> roles,

		@Size(max = 500)
		String reason
) {
}

