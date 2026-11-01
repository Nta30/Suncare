package vn.suncare.identity.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.Set;
import vn.suncare.security.RoleCode;

public record StaffProvisionRequest(
		@NotBlank(message = "loginName is required")
		@Size(max = 100)
		String loginName,

		@NotBlank(message = "password is required")
		@Size(min = 8, max = 128)
		String password,

		@Size(max = 40)
		String staffCode,

		@NotBlank(message = "fullName is required")
		@Size(max = 150)
		String fullName,

		LocalDate birthDate,
		String sex,

		@Size(max = 20)
		String phone,

		@Size(max = 254)
		String email,

		@Size(max = 500)
		String address,

		@Size(max = 100)
		String professionalLicense,

		@Size(max = 150)
		String qualification,

		@NotEmpty(message = "At least one staff role is required")
		Set<RoleCode> roles,

		Long primaryDepartmentId,
		Long headDepartmentId,

		// Trap field to detect AT02 violation (attempting to link patient_id on STAFF account)
		Long patientId,
		@JsonProperty("patient_id")
		Long snakePatientId
) {

	public boolean hasForbiddenPatientLink() {
		return patientId != null || snakePatientId != null;
	}
}

