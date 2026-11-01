package vn.suncare.security;

import java.security.Principal;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Stream;
import org.springframework.security.core.AuthenticatedPrincipal;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import vn.suncare.common.exception.DomainValidationException;
import vn.suncare.common.exception.ErrorCode;

/**
 * Immutable authenticated actor context resolved fresh on each HTTP request.
 * Enforces D01/AT02 (Account XOR Patient/Staff) and DB-02 (Role matches AccountType).
 */
public record SuncarePrincipal(
		long accountId,
		String loginName,
		AccountType accountType,
		AccountStatus status,
		boolean profileActive,
		Long patientId,
		Long staffId,
		String profileCode,
		String fullName,
		Set<RoleCode> roles,
		Set<PermissionCode> permissions,
		Long primaryDepartmentId,
		Set<Long> activeDepartmentIds,
		Set<Long> headDepartmentIds
) implements Principal, AuthenticatedPrincipal {

	public SuncarePrincipal {
		Objects.requireNonNull(loginName, "loginName must not be null");
		Objects.requireNonNull(accountType, "accountType must not be null");
		Objects.requireNonNull(status, "status must not be null");
		validateProfileXor(accountType, patientId, staffId);

		roles = roles == null
				? Set.of()
				: Collections.unmodifiableSet(new LinkedHashSet<>(roles));
		for (RoleCode role : roles) {
			if (role.accountType() != accountType) {
				throw new DomainValidationException(
						ErrorCode.ROLE_ACCOUNT_TYPE_MISMATCH,
						"Role " + role + " is not compatible with accountType " + accountType);
			}
		}

		permissions = permissions == null
				? Set.of()
				: Collections.unmodifiableSet(new LinkedHashSet<>(permissions));
		activeDepartmentIds = activeDepartmentIds == null
				? Set.of()
				: Collections.unmodifiableSet(new LinkedHashSet<>(activeDepartmentIds));
		headDepartmentIds = headDepartmentIds == null
				? Set.of()
				: Collections.unmodifiableSet(new LinkedHashSet<>(headDepartmentIds));
	}

	public static void validateProfileXor(AccountType accountType, Long patientId, Long staffId) {
		if (accountType == AccountType.PATIENT) {
			if (patientId == null || staffId != null) {
				throw new DomainValidationException(
						ErrorCode.ACCOUNT_PROFILE_XOR_VIOLATION,
						"PATIENT account must link to exactly one patient_id and null staff_id.");
			}
		} else if (accountType == AccountType.STAFF) {
			if (staffId == null || patientId != null) {
				throw new DomainValidationException(
						ErrorCode.ACCOUNT_PROFILE_XOR_VIOLATION,
						"STAFF account must link to exactly one staff_id and null patient_id.");
			}
		} else {
			throw new DomainValidationException(
					ErrorCode.ACCOUNT_PROFILE_XOR_VIOLATION,
					"Account must specify a valid accountType (PATIENT or STAFF).");
		}
	}

	@Override
	public String getName() {
		return loginName;
	}

	public boolean isUsable() {
		return status == AccountStatus.ACTIVE && profileActive;
	}

	public boolean hasRole(RoleCode role) {
		return roles.contains(role);
	}

	public boolean hasPermission(PermissionCode permission) {
		return permissions.contains(permission);
	}

	public Collection<? extends GrantedAuthority> toGrantedAuthorities() {
		Stream<String> roleNames = roles.stream().map(r -> "ROLE_" + r.name());
		Stream<String> permNames = permissions.stream().map(PermissionCode::name);
		return Stream.concat(roleNames, permNames)
				.map(SimpleGrantedAuthority::new)
				.toList();
	}
}

