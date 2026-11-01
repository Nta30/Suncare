package vn.suncare.security;

import java.util.Objects;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import vn.suncare.common.exception.ErrorCode;
import vn.suncare.common.exception.ForbiddenException;
import vn.suncare.common.exception.UnauthorizedException;

/**
 * Enforces permission + row-level scope invariants (docs/04, SEC-01, AT03):
 * - Patient self scope (patient_id == principal.patientId)
 * - Assigned doctor scope (Appointment.doctor_id == principal.staffId)
 * - Department head scope (active DepartmentHeadAssignment for targetDepartmentId)
 * - Lab department scope (active StaffDepartment for performingDepartmentId)
 */
@Component
public class RowScopeAuthorizer {

	public SuncarePrincipal requireAuthenticated() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof SuncarePrincipal principal)) {
			throw new UnauthorizedException(ErrorCode.UNAUTHORIZED, "Authentication is required.");
		}
		if (!principal.isUsable()) {
			throw new ForbiddenException(ErrorCode.ACCOUNT_LOCKED, "Account is locked or inactive.");
		}
		return principal;
	}

	public SuncarePrincipal requirePermission(PermissionCode permission) {
		Objects.requireNonNull(permission, "permission must not be null");
		SuncarePrincipal principal = requireAuthenticated();
		if (!principal.hasPermission(permission)) {
			throw new ForbiddenException(
					ErrorCode.FORBIDDEN,
					"Missing required permission: " + permission.name());
		}
		return principal;
	}

	public SuncarePrincipal requirePatientSelf(long targetPatientId, PermissionCode permission) {
		SuncarePrincipal principal = requirePermission(permission);
		if (principal.accountType() != AccountType.PATIENT
				|| !Objects.equals(principal.patientId(), targetPatientId)) {
			throw new ForbiddenException(
					ErrorCode.FORBIDDEN,
					"Patient record access denied: actor does not own patientId=" + targetPatientId);
		}
		return principal;
	}

	public SuncarePrincipal requireAssignedDoctor(long assignedDoctorStaffId, PermissionCode permission) {
		SuncarePrincipal principal = requirePermission(permission);
		if (principal.accountType() != AccountType.STAFF
				|| !principal.hasRole(RoleCode.DOCTOR)
				|| !Objects.equals(principal.staffId(), assignedDoctorStaffId)) {
			throw new ForbiddenException(
					ErrorCode.FORBIDDEN,
					"Doctor row-scope denied: actor is not the assigned doctor (staffId=" + assignedDoctorStaffId + ").");
		}
		return principal;
	}

	public SuncarePrincipal requireDepartmentHeadScope(long targetDepartmentId, PermissionCode permission) {
		SuncarePrincipal principal = requirePermission(permission);
		if (principal.accountType() != AccountType.STAFF
				|| !principal.hasRole(RoleCode.DEPARTMENT_HEAD)
				|| !principal.headDepartmentIds().contains(targetDepartmentId)) {
			throw new ForbiddenException(
					ErrorCode.FORBIDDEN,
					"Department Head row-scope denied for departmentId=" + targetDepartmentId);
		}
		return principal;
	}

	public SuncarePrincipal requireLabDepartmentScope(long performingDepartmentId, PermissionCode permission) {
		SuncarePrincipal principal = requirePermission(permission);
		if (principal.accountType() != AccountType.STAFF
				|| !principal.hasRole(RoleCode.LAB_STAFF)
				|| !principal.activeDepartmentIds().contains(performingDepartmentId)) {
			throw new ForbiddenException(
					ErrorCode.FORBIDDEN,
					"Lab staff row-scope denied for performingDepartmentId=" + performingDepartmentId);
		}
		return principal;
	}
}

