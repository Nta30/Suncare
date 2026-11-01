package vn.suncare.identity.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ProfileUpdateRequest(
		@NotBlank(message = "fullName is required")
		@Size(max = 150)
		String fullName,

		@Size(max = 20)
		String phone,

		@Size(max = 254)
		String email,

		@Size(max = 500)
		String address,

		@Size(max = 150)
		String emergencyName,

		@Size(max = 20)
		String emergencyPhone,

		@Size(max = 150)
		String qualification,

		// Trap fields per TX01: profile update cannot mutate accountType, patientId, staffId, or roles
		String accountType,
		@JsonProperty("account_type")
		String snakeAccountType,
		Long patientId,
		@JsonProperty("patient_id")
		Long snakePatientId,
		Long staffId,
		@JsonProperty("staff_id")
		Long snakeStaffId,
		List<String> roles
) {

	public boolean hasImmutableFieldAttempt() {
		return (accountType != null && !accountType.isBlank())
				|| (snakeAccountType != null && !snakeAccountType.isBlank())
				|| patientId != null
				|| snakePatientId != null
				|| staffId != null
				|| snakeStaffId != null
				|| (roles != null && !roles.isEmpty());
	}
}

