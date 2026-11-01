package vn.suncare.identity.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.suncare.common.api.CorrelationIdFilter;
import vn.suncare.identity.application.IdentityService;
import vn.suncare.security.PermissionCode;
import vn.suncare.security.RowScopeAuthorizer;
import vn.suncare.security.SuncarePrincipal;

@RestController
@RequestMapping(path = "/api/v1/identity", produces = MediaType.APPLICATION_JSON_VALUE)
public class IdentityProfileController {

	private final IdentityService identityService;
	private final RowScopeAuthorizer rowScopeAuthorizer;

	public IdentityProfileController(
			IdentityService identityService,
			RowScopeAuthorizer rowScopeAuthorizer) {
		this.identityService = identityService;
		this.rowScopeAuthorizer = rowScopeAuthorizer;
	}

	@PatchMapping(path = "/profile", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<PrincipalSummaryDto> updateOwnProfile(
			@Valid @RequestBody ProfileUpdateRequest request,
			HttpServletRequest httpRequest) {
		String correlationId = CorrelationIdFilter.resolve(httpRequest);
		return ResponseEntity.ok(identityService.updateOwnProfile(request, correlationId));
	}

	@GetMapping(path = "/scope-check/departments/{departmentId}/schedule-publish")
	public ResponseEntity<Map<String, Object>> verifyDepartmentHeadScope(
			@PathVariable("departmentId") long departmentId) {
		SuncarePrincipal principal = rowScopeAuthorizer.requireDepartmentHeadScope(
				departmentId,
				PermissionCode.SCHEDULE_PUBLISH_DEPARTMENT
		);
		return ResponseEntity.ok(Map.of(
				"allowed", true,
				"accountId", principal.accountId(),
				"staffId", principal.staffId(),
				"departmentId", departmentId,
				"permission", PermissionCode.SCHEDULE_PUBLISH_DEPARTMENT.name()
		));
	}

	@GetMapping(path = "/scope-check/doctors/{doctorStaffId}/encounters")
	public ResponseEntity<Map<String, Object>> verifyAssignedDoctorScope(
			@PathVariable("doctorStaffId") long doctorStaffId) {
		SuncarePrincipal principal = rowScopeAuthorizer.requireAssignedDoctor(
				doctorStaffId,
				PermissionCode.ENCOUNTER_WRITE_ASSIGNED
		);
		return ResponseEntity.ok(Map.of(
				"allowed", true,
				"accountId", principal.accountId(),
				"staffId", principal.staffId(),
				"doctorStaffId", doctorStaffId,
				"permission", PermissionCode.ENCOUNTER_WRITE_ASSIGNED.name()
		));
	}

	@GetMapping(path = "/scope-check/patients/{patientId}/emr")
	public ResponseEntity<Map<String, Object>> verifyPatientSelfScope(
			@PathVariable("patientId") long patientId) {
		SuncarePrincipal principal = rowScopeAuthorizer.requirePatientSelf(
				patientId,
				PermissionCode.EMR_READ_SELF
		);
		return ResponseEntity.ok(Map.of(
				"allowed", true,
				"accountId", principal.accountId(),
				"patientId", principal.patientId(),
				"permission", PermissionCode.EMR_READ_SELF.name()
		));
	}
}

