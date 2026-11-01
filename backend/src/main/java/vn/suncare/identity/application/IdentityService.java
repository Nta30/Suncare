package vn.suncare.identity.application;

import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.suncare.common.exception.ConflictException;
import vn.suncare.common.exception.DomainValidationException;
import vn.suncare.common.exception.ErrorCode;
import vn.suncare.common.exception.ForbiddenException;
import vn.suncare.common.exception.ResourceNotFoundException;
import vn.suncare.common.exception.UnauthorizedException;
import vn.suncare.common.idempotency.CommandExecutionOutcome;
import vn.suncare.common.idempotency.CommandIdempotencyService;
import vn.suncare.common.idempotency.CommandReceiptResult;
import vn.suncare.identity.api.AccountRolesUpdateRequest;
import vn.suncare.identity.api.AccountStatusUpdateRequest;
import vn.suncare.identity.api.AuthSessionResponse;
import vn.suncare.identity.api.DepartmentHeadAssignRequest;
import vn.suncare.identity.api.LoginRequest;
import vn.suncare.identity.api.PatientRegistrationRequest;
import vn.suncare.identity.api.PrincipalSummaryDto;
import vn.suncare.identity.api.ProfileUpdateRequest;
import vn.suncare.identity.api.StaffProvisionRequest;
import vn.suncare.identity.persistence.AccountCredentialsRecord;
import vn.suncare.identity.persistence.IdentityRepository;
import vn.suncare.security.AccountStatus;
import vn.suncare.security.AccountType;
import vn.suncare.security.PermissionCode;
import vn.suncare.security.RoleCode;
import vn.suncare.security.RowScopeAuthorizer;
import vn.suncare.security.SecurityProperties;
import vn.suncare.security.SuncarePrincipal;
import vn.suncare.security.SuncareTokenService;

@Service
public class IdentityService {

	private static final Set<String> ALLOWED_SEX = Set.of("UNKNOWN", "MALE", "FEMALE", "OTHER");
	private static final AtomicLong CODE_SEQ = new AtomicLong(1000L);

	private final IdentityRepository identityRepository;
	private final PasswordEncoder passwordEncoder;
	private final SuncareTokenService tokenService;
	private final SecurityProperties securityProperties;
	private final RowScopeAuthorizer rowScopeAuthorizer;
	private final CommandIdempotencyService idempotencyService;
	private final Clock clock;

	public IdentityService(
			IdentityRepository identityRepository,
			PasswordEncoder passwordEncoder,
			SuncareTokenService tokenService,
			SecurityProperties securityProperties,
			RowScopeAuthorizer rowScopeAuthorizer,
			CommandIdempotencyService idempotencyService,
			Clock clock) {
		this.identityRepository = Objects.requireNonNull(identityRepository, "identityRepository must not be null");
		this.passwordEncoder = Objects.requireNonNull(passwordEncoder, "passwordEncoder must not be null");
		this.tokenService = Objects.requireNonNull(tokenService, "tokenService must not be null");
		this.securityProperties = Objects.requireNonNull(securityProperties, "securityProperties must not be null");
		this.rowScopeAuthorizer = Objects.requireNonNull(rowScopeAuthorizer, "rowScopeAuthorizer must not be null");
		this.idempotencyService = Objects.requireNonNull(idempotencyService, "idempotencyService must not be null");
		this.clock = Objects.requireNonNull(clock, "clock must not be null");
	}

	@Transactional
	public PrincipalSummaryDto registerPatient(
			PatientRegistrationRequest request,
			String idempotencyKey,
			String correlationId) {
		Objects.requireNonNull(request, "request must not be null");
		if (request.hasForbiddenPrivilegeFields()) {
			throw new DomainValidationException(
					ErrorCode.FORBIDDEN_REGISTRATION_FIELD,
					"Public registration only creates PATIENT accounts; role, accountType, staffId, and departmentId are forbidden.");
		}

		String normalizedLogin = normalizeLoginName(request.loginName());
		String normalizedSex = normalizeSex(request.sex());
		String fullName = request.fullName().trim();

		if (idempotencyKey != null && !idempotencyKey.isBlank()) {
			String canonicalPayload = "REGISTER|" + normalizedLogin + "|" + fullName + "|"
					+ Objects.toString(request.birthDate(), "") + "|" + normalizedSex + "|"
					+ Objects.toString(request.phone(), "") + "|" + Objects.toString(request.email(), "");
			CommandReceiptResult receipt = idempotencyService.executeIdempotent(
					null,
					"PATIENT_REGISTER",
					idempotencyKey,
					canonicalPayload,
					() -> {
						long accountId = doCreatePatientAccount(request, normalizedLogin, normalizedSex, fullName, correlationId);
						return new CommandExecutionOutcome("Account", accountId);
					}
			);
			return loadPrincipalSummary(receipt.resourceId());
		}

		long accountId = doCreatePatientAccount(request, normalizedLogin, normalizedSex, fullName, correlationId);
		return loadPrincipalSummary(accountId);
	}

	private long doCreatePatientAccount(
			PatientRegistrationRequest request,
			String normalizedLogin,
			String normalizedSex,
			String fullName,
			String correlationId) {
		if (identityRepository.existsByLoginName(normalizedLogin)) {
			throw new ConflictException(ErrorCode.CONFLICT, "Login name is already registered: " + normalizedLogin);
		}
		Instant now = Instant.now(clock);
		String patientCode = generateBusinessCode("PAT");
		long patientId = identityRepository.insertPatient(
				patientCode,
				fullName,
				request.birthDate(),
				normalizedSex,
				trimToNull(request.phone()),
				trimToNull(request.email()),
				trimToNull(request.address()),
				trimToNull(request.identityNumber()),
				trimToNull(request.emergencyName()),
				trimToNull(request.emergencyPhone()),
				now
		);
		String passwordHash = passwordEncoder.encode(request.password());
		long accountId = identityRepository.insertAccount(
				normalizedLogin,
				passwordHash,
				AccountType.PATIENT,
				patientId,
				null,
				AccountStatus.ACTIVE,
				now
		);
		identityRepository.replaceAccountRoles(
				accountId,
				AccountType.PATIENT,
				Set.of(RoleCode.PATIENT),
				accountId,
				now
		);
		identityRepository.recordAuditEvent(
				accountId,
				"USER",
				"PATIENT_REGISTERED",
				"Account",
				accountId,
				correlationId,
				"Public patient self-registration",
				null,
				now
		);
		return accountId;
	}

	@Transactional
	public AuthSessionResponse login(LoginRequest request, String correlationId) {
		Objects.requireNonNull(request, "request must not be null");
		String normalizedLogin = normalizeLoginName(request.loginName());
		AccountCredentialsRecord credentials = identityRepository.findCredentialsByLoginName(normalizedLogin)
				.orElseThrow(() -> new UnauthorizedException(
						ErrorCode.INVALID_CREDENTIALS,
						"Invalid login name or password."));

		if (!passwordEncoder.matches(request.password(), credentials.passwordHash())) {
			throw new UnauthorizedException(
					ErrorCode.INVALID_CREDENTIALS,
					"Invalid login name or password.");
		}

		SuncarePrincipal principal = identityRepository.findPrincipalByAccountId(credentials.accountId())
				.orElseThrow(() -> new UnauthorizedException(
						ErrorCode.INVALID_CREDENTIALS,
						"Account was not found."));

		if (!principal.isUsable()) {
			throw new ForbiddenException(
					ErrorCode.ACCOUNT_LOCKED,
					"Account or underlying profile is locked or inactive.");
		}

		Instant now = Instant.now(clock);
		identityRepository.touchLastLogin(principal.accountId(), now);
		identityRepository.recordAuditEvent(
				principal.accountId(),
				"USER",
				"AUTH_LOGIN_SUCCEEDED",
				"Account",
				principal.accountId(),
				correlationId,
				"User authenticated",
				null,
				now
		);

		String token = tokenService.issueToken(principal);
		return new AuthSessionResponse(
				token,
				"Bearer",
				securityProperties.getTokenTtlSeconds(),
				PrincipalSummaryDto.from(principal)
		);
	}

	@Transactional(readOnly = true)
	public PrincipalSummaryDto getCurrentPrincipalSummary() {
		SuncarePrincipal principal = rowScopeAuthorizer.requireAuthenticated();
		return PrincipalSummaryDto.from(principal);
	}

	@Transactional
	public PrincipalSummaryDto provisionStaffAccount(
			StaffProvisionRequest request,
			String idempotencyKey,
			String correlationId) {
		Objects.requireNonNull(request, "request must not be null");
		SuncarePrincipal admin = rowScopeAuthorizer.requirePermission(PermissionCode.ACCOUNT_MANAGE);

		if (request.hasForbiddenPatientLink()) {
			throw new DomainValidationException(
					ErrorCode.ACCOUNT_PROFILE_XOR_VIOLATION,
					"STAFF account cannot link to a patient_id.");
		}

		for (RoleCode role : request.roles()) {
			if (role.accountType() != AccountType.STAFF) {
				throw new DomainValidationException(
						ErrorCode.ROLE_ACCOUNT_TYPE_MISMATCH,
						"Role " + role + " is not a STAFF role.");
			}
		}

		String normalizedLogin = normalizeLoginName(request.loginName());
		String normalizedSex = normalizeSex(request.sex());
		String fullName = request.fullName().trim();
		String sortedRoles = request.roles().stream().map(RoleCode::name).sorted().reduce((a, b) -> a + "," + b).orElse("");

		if (idempotencyKey != null && !idempotencyKey.isBlank()) {
			String canonicalPayload = "STAFF_PROVISION|" + normalizedLogin + "|" + fullName + "|"
					+ sortedRoles + "|" + Objects.toString(request.primaryDepartmentId(), "") + "|"
					+ Objects.toString(request.headDepartmentId(), "");
			CommandReceiptResult receipt = idempotencyService.executeIdempotent(
					admin.accountId(),
					"STAFF_PROVISION",
					idempotencyKey,
					canonicalPayload,
					() -> {
						long accountId = doCreateStaffAccount(request, admin.accountId(), normalizedLogin, normalizedSex, fullName, correlationId);
						return new CommandExecutionOutcome("Account", accountId);
					}
			);
			return loadPrincipalSummary(receipt.resourceId());
		}

		long accountId = doCreateStaffAccount(request, admin.accountId(), normalizedLogin, normalizedSex, fullName, correlationId);
		return loadPrincipalSummary(accountId);
	}

	private long doCreateStaffAccount(
			StaffProvisionRequest request,
			long adminAccountId,
			String normalizedLogin,
			String normalizedSex,
			String fullName,
			String correlationId) {
		if (identityRepository.existsByLoginName(normalizedLogin)) {
			throw new ConflictException(ErrorCode.CONFLICT, "Login name is already registered: " + normalizedLogin);
		}
		Instant now = Instant.now(clock);
		String staffCode = trimToNull(request.staffCode()) != null
				? request.staffCode().trim()
				: generateBusinessCode("STF");

		long staffId = identityRepository.insertStaff(
				staffCode,
				fullName,
				request.birthDate(),
				normalizedSex,
				trimToNull(request.phone()),
				trimToNull(request.email()),
				trimToNull(request.address()),
				trimToNull(request.professionalLicense()),
				trimToNull(request.qualification()),
				now
		);

		String passwordHash = passwordEncoder.encode(request.password());
		long accountId = identityRepository.insertAccount(
				normalizedLogin,
				passwordHash,
				AccountType.STAFF,
				null,
				staffId,
				AccountStatus.ACTIVE,
				now
		);

		identityRepository.replaceAccountRoles(
				accountId,
				AccountType.STAFF,
				request.roles(),
				adminAccountId,
				now
		);

		if (request.primaryDepartmentId() != null) {
			identityRepository.assignPrimaryStaffDepartment(staffId, request.primaryDepartmentId(), now, now);
		}

		if (request.headDepartmentId() != null) {
			if (!request.roles().contains(RoleCode.DEPARTMENT_HEAD)) {
				throw new DomainValidationException(
						"headDepartmentId requires DEPARTMENT_HEAD in the granted roles.");
			}
			identityRepository.insertDepartmentHeadAssignment(
					staffId,
					request.headDepartmentId(),
					now,
					null,
					adminAccountId,
					now
			);
		}

		identityRepository.recordAuditEvent(
				adminAccountId,
				"USER",
				"STAFF_ACCOUNT_PROVISIONED",
				"Account",
				accountId,
				correlationId,
				"Admin provisioned staff account",
				null,
				now
		);
		return accountId;
	}

	@Transactional
	public PrincipalSummaryDto updateAccountStatus(
			long targetAccountId,
			AccountStatusUpdateRequest request,
			String correlationId) {
		Objects.requireNonNull(request, "request must not be null");
		SuncarePrincipal admin = rowScopeAuthorizer.requirePermission(PermissionCode.ACCOUNT_MANAGE);
		if (admin.accountId() == targetAccountId && request.status() == AccountStatus.LOCKED) {
			throw new DomainValidationException("Administrator cannot lock their own active account.");
		}

		Instant now = Instant.now(clock);
		identityRepository.updateAccountStatus(targetAccountId, request.status(), now);
		identityRepository.recordAuditEvent(
				admin.accountId(),
				"USER",
				"ACCOUNT_STATUS_CHANGED",
				"Account",
				targetAccountId,
				correlationId,
				trimToNull(request.reason()) != null ? request.reason().trim() : "Status updated to " + request.status(),
				"{\"status\":\"" + request.status().name() + "\"}",
				now
		);
		return loadPrincipalSummary(targetAccountId);
	}

	@Transactional
	public PrincipalSummaryDto replaceAccountRoles(
			long targetAccountId,
			AccountRolesUpdateRequest request,
			String correlationId) {
		Objects.requireNonNull(request, "request must not be null");
		SuncarePrincipal admin = rowScopeAuthorizer.requirePermission(PermissionCode.ACCOUNT_MANAGE);
		AccountCredentialsRecord target = identityRepository.findCredentialsByAccountId(targetAccountId)
				.orElseThrow(() -> new ResourceNotFoundException("Account not found: id=" + targetAccountId));

		Instant now = Instant.now(clock);
		identityRepository.replaceAccountRoles(
				targetAccountId,
				target.accountType(),
				request.roles(),
				admin.accountId(),
				now
		);
		identityRepository.recordAuditEvent(
				admin.accountId(),
				"USER",
				"ACCOUNT_ROLES_UPDATED",
				"Account",
				targetAccountId,
				correlationId,
				trimToNull(request.reason()) != null ? request.reason().trim() : "Updated account roles",
				null,
				now
		);
		return loadPrincipalSummary(targetAccountId);
	}

	@Transactional
	public void assignDepartmentHead(
			long staffId,
			DepartmentHeadAssignRequest request,
			String correlationId) {
		Objects.requireNonNull(request, "request must not be null");
		SuncarePrincipal admin = rowScopeAuthorizer.requirePermission(PermissionCode.ACCOUNT_MANAGE);
		Instant now = Instant.now(clock);
		Instant validFrom = request.validFrom() != null ? request.validFrom() : now;
		long assignmentId = identityRepository.insertDepartmentHeadAssignment(
				staffId,
				request.departmentId(),
				validFrom,
				request.validTo(),
				admin.accountId(),
				now
		);
		identityRepository.recordAuditEvent(
				admin.accountId(),
				"USER",
				"DEPARTMENT_HEAD_ASSIGNED",
				"DepartmentHeadAssignment",
				assignmentId,
				correlationId,
				"Assigned department head scope",
				null,
				now
		);
	}

	@Transactional
	public PrincipalSummaryDto updateOwnProfile(ProfileUpdateRequest request, String correlationId) {
		Objects.requireNonNull(request, "request must not be null");
		SuncarePrincipal principal = rowScopeAuthorizer.requirePermission(PermissionCode.PROFILE_EDIT_SELF);
		if (request.hasImmutableFieldAttempt()) {
			throw new DomainValidationException(
					"Profile update cannot modify accountType, patientId, staffId, or roles.");
		}

		Instant now = Instant.now(clock);
		String fullName = request.fullName().trim();
		if (principal.accountType() == AccountType.PATIENT) {
			identityRepository.updatePatientSelfProfile(
					Objects.requireNonNull(principal.patientId()),
					fullName,
					trimToNull(request.phone()),
					trimToNull(request.email()),
					trimToNull(request.address()),
					trimToNull(request.emergencyName()),
					trimToNull(request.emergencyPhone()),
					now
			);
		} else {
			identityRepository.updateStaffSelfProfile(
					Objects.requireNonNull(principal.staffId()),
					fullName,
					trimToNull(request.phone()),
					trimToNull(request.email()),
					trimToNull(request.address()),
					trimToNull(request.qualification()),
					now
			);
		}
		identityRepository.recordAuditEvent(
				principal.accountId(),
				"USER",
				"PROFILE_UPDATED_SELF",
				"Account",
				principal.accountId(),
				correlationId,
				"Self profile update",
				null,
				now
		);
		return loadPrincipalSummary(principal.accountId());
	}

	private PrincipalSummaryDto loadPrincipalSummary(long accountId) {
		SuncarePrincipal principal = identityRepository.findPrincipalByAccountId(accountId)
				.orElseThrow(() -> new ResourceNotFoundException("Account not found: id=" + accountId));
		return PrincipalSummaryDto.from(principal);
	}

	private static String normalizeLoginName(String raw) {
		if (raw == null || raw.trim().isEmpty()) {
			throw new DomainValidationException("loginName must not be blank.");
		}
		return raw.trim().toLowerCase(Locale.ROOT);
	}

	private static String normalizeSex(String raw) {
		if (raw == null || raw.isBlank()) {
			return "UNKNOWN";
		}
		String upper = raw.trim().toUpperCase(Locale.ROOT);
		if (!ALLOWED_SEX.contains(upper)) {
			throw new DomainValidationException("sex must be one of UNKNOWN, MALE, FEMALE, OTHER.");
		}
		return upper;
	}

	private static String trimToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	private static String generateBusinessCode(String prefix) {
		long seq = CODE_SEQ.incrementAndGet();
		String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT);
		return prefix + "-" + seq + "-" + suffix;
	}
}

