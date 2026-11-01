package vn.suncare.identity.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record PatientRegistrationRequest(
		@NotBlank(message = "loginName is required")
		@Size(max = 100, message = "loginName must be at most 100 characters")
		String loginName,

		@NotBlank(message = "password is required")
		@Size(min = 8, max = 128, message = "password must be between 8 and 128 characters")
		String password,

		@NotBlank(message = "fullName is required")
		@Size(max = 150, message = "fullName must be at most 150 characters")
		String fullName,

		LocalDate birthDate,
		String sex,

		@Size(max = 20)
		String phone,

		@Size(max = 254)
		String email,

		@Size(max = 500)
		String address,

		@Size(max = 30)
		String identityNumber,

		@Size(max = 150)
		String emergencyName,

		@Size(max = 20)
		String emergencyPhone,

		// Trap fields to explicitly detect & reject privilege-escalation payloads (AT01)
		String role,
		List<String> roles,
		String accountType,
		@JsonProperty("account_type")
		String snakeAccountType,
		Long staffId,
		@JsonProperty("staff_id")
		Long snakeStaffId,
		Long departmentId,
		@JsonProperty("department_id")
		Long snakeDepartmentId
) {

	public boolean hasForbiddenPrivilegeFields() {
		return (role != null && !role.isBlank())
				|| (roles != null && !roles.isEmpty())
				|| (accountType != null && !accountType.isBlank())
				|| (snakeAccountType != null && !snakeAccountType.isBlank())
				|| staffId != null
				|| snakeStaffId != null
				|| departmentId != null
				|| snakeDepartmentId != null;
	}
}

