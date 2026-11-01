package vn.suncare.identity.api;

import java.util.List;
import vn.suncare.security.AccountStatus;
import vn.suncare.security.AccountType;
import vn.suncare.security.PermissionCode;
import vn.suncare.security.RoleCode;
import vn.suncare.security.SuncarePrincipal;

public record PrincipalSummaryDto(
		long accountId,
		String loginName,
		AccountType accountType,
		AccountStatus status,
		Long patientId,
		Long staffId,
		String profileCode,
		String fullName,
		List<String> roles,
		List<String> permissions,
		Long primaryDepartmentId,
		List<Long> activeDepartmentIds,
		List<Long> headDepartmentIds
) {

	public static PrincipalSummaryDto from(SuncarePrincipal principal) {
		return new PrincipalSummaryDto(
				principal.accountId(),
				principal.loginName(),
				principal.accountType(),
				principal.status(),
				principal.patientId(),
				principal.staffId(),
				principal.profileCode(),
				principal.fullName(),
				principal.roles().stream().map(RoleCode::name).toList(),
				principal.permissions().stream().map(PermissionCode::name).toList(),
				principal.primaryDepartmentId(),
				List.copyOf(principal.activeDepartmentIds()),
				List.copyOf(principal.headDepartmentIds())
		);
	}
}

