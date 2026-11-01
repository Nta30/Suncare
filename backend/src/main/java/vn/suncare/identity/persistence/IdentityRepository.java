package vn.suncare.identity.persistence;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;
import vn.suncare.security.AccountStatus;
import vn.suncare.security.AccountType;
import vn.suncare.security.PrincipalLookupPort;
import vn.suncare.security.RoleCode;

public interface IdentityRepository extends PrincipalLookupPort {

	Optional<AccountCredentialsRecord> findCredentialsByLoginName(String normalizedLoginName);

	Optional<AccountCredentialsRecord> findCredentialsByAccountId(long accountId);

	boolean existsByLoginName(String normalizedLoginName);

	long insertPatient(
			String code,
			String fullName,
			LocalDate birthDate,
			String sex,
			String phone,
			String email,
			String address,
			String identityNumber,
			String emergencyName,
			String emergencyPhone,
			Instant now);

	long insertStaff(
			String code,
			String fullName,
			LocalDate birthDate,
			String sex,
			String phone,
			String email,
			String address,
			String professionalLicense,
			String qualification,
			Instant now);

	long insertAccount(
			String normalizedLoginName,
			String passwordHash,
			AccountType accountType,
			Long patientId,
			Long staffId,
			AccountStatus status,
			Instant now);

	void replaceAccountRoles(
			long accountId,
			AccountType accountType,
			Set<RoleCode> roles,
			long grantedByAccountId,
			Instant now);

	void updateAccountStatus(long accountId, AccountStatus status, Instant now);

	void touchLastLogin(long accountId, Instant now);

	long assignPrimaryStaffDepartment(
			long staffId,
			long departmentId,
			Instant validFrom,
			Instant now);

	long insertDepartmentHeadAssignment(
			long staffId,
			long departmentId,
			Instant validFrom,
			Instant validTo,
			long assignedByAccountId,
			Instant now);

	void updatePatientSelfProfile(
			long patientId,
			String fullName,
			String phone,
			String email,
			String address,
			String emergencyName,
			String emergencyPhone,
			Instant now);

	void updateStaffSelfProfile(
			long staffId,
			String fullName,
			String phone,
			String email,
			String address,
			String qualification,
			Instant now);

	void recordAuditEvent(
			Long actorId,
			String actorType,
			String action,
			String entityType,
			long entityId,
			String correlationId,
			String reason,
			String redactedChange,
			Instant now);
}

