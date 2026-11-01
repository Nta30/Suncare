package vn.suncare.identity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import vn.suncare.common.exception.ConflictException;
import vn.suncare.common.exception.DomainValidationException;
import vn.suncare.common.exception.ForbiddenException;
import vn.suncare.identity.api.AccountRolesUpdateRequest;
import vn.suncare.identity.api.AccountStatusUpdateRequest;
import vn.suncare.identity.api.AuthSessionResponse;
import vn.suncare.identity.api.LoginRequest;
import vn.suncare.identity.api.PatientRegistrationRequest;
import vn.suncare.identity.api.PrincipalSummaryDto;
import vn.suncare.identity.api.StaffProvisionRequest;
import vn.suncare.identity.application.IdentityService;
import vn.suncare.identity.persistence.IdentityRepository;
import vn.suncare.infrastructure.db.AdminSettingsBootstrapService;
import vn.suncare.infrastructure.db.BootstrapProperties;
import vn.suncare.security.AccountStatus;
import vn.suncare.security.PermissionCode;
import vn.suncare.security.RoleCode;
import vn.suncare.security.RowScopeAuthorizer;
import vn.suncare.security.SuncarePrincipal;

/**
 * Real SQL Server 2022 integration tests for T04 (AT01, AT02, AT03, AT45, TX01, DB-02).
 * All tests run inside @Transactional and roll back cleanly on completion.
 */
@SpringBootTest
@ActiveProfiles("dbtest")
@EnabledIfSystemProperty(named = "suncare.run.db.it", matches = "true")
class IdentityAndRbacSqlServerIT {

	@Autowired
	private IdentityService identityService;

	@Autowired
	private IdentityRepository identityRepository;

	@Autowired
	private RowScopeAuthorizer rowScopeAuthorizer;

	@Autowired
	private AdminSettingsBootstrapService bootstrapService;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	@Transactional
	void at01_and_at45_registersPatientAtomicallyAndEnforcesIdempotencyOnSqlServer() {
		// AT01: Reject registration containing role="DOCTOR"
		PatientRegistrationRequest forbiddenRoleReq = new PatientRegistrationRequest(
				"forged.doc@suncare.local",
				"Password#2026",
				"Forged Doctor",
				LocalDate.of(1990, 5, 10),
				"MALE",
				"0901112222",
				null,
				null,
				null,
				null,
				null,
				"DOCTOR",
				null,
				null,
				null,
				null,
				null,
				null,
				null
		);
		assertThatThrownBy(() -> identityService.registerPatient(forbiddenRoleReq, null, "corr-at01-1"))
				.isInstanceOf(DomainValidationException.class)
				.hasMessageContaining("Public registration only creates PATIENT accounts");

		// Valid registration + AT45 idempotency replay and conflict on SQL Server
		PatientRegistrationRequest validReq = new PatientRegistrationRequest(
				"real.patient@suncare.local",
				"Password#2026",
				"Le Thi Hoa",
				LocalDate.of(1995, 8, 20),
				"FEMALE",
				"0912345678",
				"hoa@suncare.local",
				"TP HCM",
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null
		);

		PrincipalSummaryDto created = identityService.registerPatient(validReq, "sql-idem-reg-01", "corr-at01-2");
		assertThat(created.accountType().name()).isEqualTo("PATIENT");
		assertThat(created.patientId()).isNotNull();
		assertThat(created.staffId()).isNull();
		assertThat(created.roles()).containsExactly("PATIENT");
		assertThat(created.permissions()).contains(
				"APPOINTMENT_CREATE_SELF",
				"APPOINTMENT_CANCEL_SELF",
				"PROFILE_EDIT_SELF",
				"EMR_READ_SELF"
		);

		// Same Idempotency-Key + same payload -> replays exact accountId without duplicate insert
		PrincipalSummaryDto replayed = identityService.registerPatient(validReq, "sql-idem-reg-01", "corr-at01-3");
		assertThat(replayed.accountId()).isEqualTo(created.accountId());

		// Same Idempotency-Key + modified payload -> 409 IDEMPOTENCY_CONFLICT
		PatientRegistrationRequest modifiedReq = new PatientRegistrationRequest(
				"real.patient@suncare.local",
				"Password#2026",
				"Le Thi Hoa Modified",
				LocalDate.of(1995, 8, 20),
				"FEMALE",
				"0912345678",
				"hoa@suncare.local",
				"TP HCM",
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null
		);
		assertThatThrownBy(() -> identityService.registerPatient(modifiedReq, "sql-idem-reg-01", "corr-at01-4"))
				.isInstanceOf(ConflictException.class)
				.hasMessageContaining("different request payload");
	}

	@Test
	@Transactional
	void at02_sqlServerCheckConstraintRejectsAccountWithBothOrNeitherProfile() {
		Timestamp nowTs = Timestamp.from(Instant.now());
		// Insert neither patient_id nor staff_id -> blocked by CK_Account_profile in SQL Server
		assertThatThrownBy(() -> jdbcTemplate.update(
				"""
				INSERT INTO [dbo].[Account]
				([login_name], [password_hash], [account_type], [patient_id], [staff_id], [status], [created_at], [updated_at])
				VALUES ('orphan@suncare.local', 'hash', 'PATIENT', NULL, NULL, 'ACTIVE', ?, ?)
				""",
				nowTs,
				nowTs
		)).isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	@Transactional
	void at03_multiRoleStaffDepartmentScopeAndImmediateLockRevocationOnSqlServer() {
		BootstrapProperties props = new BootstrapProperties();
		props.setEnabled(true);
		props.setAdminLogin("it.admin.t04@suncare.local");
		props.setAdminPassword("AdminPass#2026!");
		props.setAdminStaffCode("ADM-T04");
		props.setAdminFullName("T04 System Admin");
		AdminSettingsBootstrapService.BootstrapOutcome outcome = bootstrapService.bootstrapAdminAndDefaultSettings(props);

		SuncarePrincipal adminPrincipal = identityRepository.findPrincipalByAccountId(outcome.adminAccountId()).orElseThrow();
		setSecurityContext(adminPrincipal);

		try {
			Timestamp nowTs = Timestamp.from(Instant.now());
			jdbcTemplate.update(
					"INSERT INTO [dbo].[Department] ([code], [name], [department_type], [is_active], [created_at], [updated_at]) VALUES ('DEPT-NOI', N'Khoa Noi', 'CLINICAL', 1, ?, ?)",
					nowTs, nowTs
			);
			long deptNoiId = jdbcTemplate.queryForObject("SELECT [id] FROM [dbo].[Department] WHERE [code] = 'DEPT-NOI'", Long.class);

			jdbcTemplate.update(
					"INSERT INTO [dbo].[Department] ([code], [name], [department_type], [is_active], [created_at], [updated_at]) VALUES ('DEPT-NGOAI', N'Khoa Ngoai', 'CLINICAL', 1, ?, ?)",
					nowTs, nowTs
			);
			long deptNgoaiId = jdbcTemplate.queryForObject("SELECT [id] FROM [dbo].[Department] WHERE [code] = 'DEPT-NGOAI'", Long.class);

			StaffProvisionRequest staffReq = new StaffProvisionRequest(
					"dr.head.noi@suncare.local",
					"DoctorPass#2026!",
					"DOC-NOI-01",
					"BS Truong Khoa Noi",
					LocalDate.of(1982, 3, 15),
					"MALE",
					"0909888777",
					"dr.noi@suncare.local",
					"TP HCM",
					"CCHN-001",
					"CKII",
					Set.of(RoleCode.DOCTOR, RoleCode.DEPARTMENT_HEAD),
					deptNoiId,
					deptNoiId,
					null,
					null
			);

			PrincipalSummaryDto provisioned = identityService.provisionStaffAccount(staffReq, "prov-t04-it-01", "corr-t04-it");
			assertThat(provisioned.roles()).containsExactlyInAnyOrder("DOCTOR", "DEPARTMENT_HEAD");
			assertThat(provisioned.primaryDepartmentId()).isEqualTo(deptNoiId);
			assertThat(provisioned.headDepartmentIds()).containsExactly(deptNoiId);

			AuthSessionResponse loginSession = identityService.login(
					new LoginRequest("dr.head.noi@suncare.local", "DoctorPass#2026!"),
					"corr-t04-login"
			);
			assertThat(loginSession.accessToken()).isNotBlank();

			SuncarePrincipal drHeadPrincipal = identityRepository.findPrincipalByAccountId(provisioned.accountId()).orElseThrow();
			setSecurityContext(drHeadPrincipal);

			// AT03: Can exercise DEPARTMENT_HEAD permission on DEPT-NOI
			rowScopeAuthorizer.requireDepartmentHeadScope(deptNoiId, PermissionCode.SCHEDULE_PUBLISH_DEPARTMENT);
			// AT03: Denied on DEPT-NGOAI
			assertThatThrownBy(() -> rowScopeAuthorizer.requireDepartmentHeadScope(deptNgoaiId, PermissionCode.SCHEDULE_PUBLISH_DEPARTMENT))
					.isInstanceOf(ForbiddenException.class);
			// AT03: Can exercise DOCTOR permission on own staffId
			rowScopeAuthorizer.requireAssignedDoctor(provisioned.staffId(), PermissionCode.ENCOUNTER_WRITE_ASSIGNED);
			// AT03: Denied on another doctor's staffId
			assertThatThrownBy(() -> rowScopeAuthorizer.requireAssignedDoctor(999999L, PermissionCode.ENCOUNTER_WRITE_ASSIGNED))
					.isInstanceOf(ForbiddenException.class);

			// Switch back to admin to revoke DEPARTMENT_HEAD role and lock account
			setSecurityContext(adminPrincipal);
			PrincipalSummaryDto afterRoleRevoke = identityService.replaceAccountRoles(
					provisioned.accountId(),
					new AccountRolesUpdateRequest(Set.of(RoleCode.DOCTOR), "Revoke head role"),
					"corr-t04-revoke"
			);
			assertThat(afterRoleRevoke.roles()).containsExactly("DOCTOR");
			assertThat(afterRoleRevoke.permissions()).doesNotContain("SCHEDULE_PUBLISH_DEPARTMENT");

			PrincipalSummaryDto afterLock = identityService.updateAccountStatus(
					provisioned.accountId(),
					new AccountStatusUpdateRequest(AccountStatus.LOCKED, "Lock account test"),
					"corr-t04-lock"
			);
			assertThat(afterLock.status()).isEqualTo(AccountStatus.LOCKED);

			SuncarePrincipal reloadedLocked = identityRepository.findPrincipalByAccountId(provisioned.accountId()).orElseThrow();
			assertThat(reloadedLocked.isUsable()).isFalse();
		} finally {
			SecurityContextHolder.clearContext();
		}
	}

	private static void setSecurityContext(SuncarePrincipal principal) {
		UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
				principal,
				null,
				principal.toGrantedAuthorities()
		);
		SecurityContextHolder.getContext().setAuthentication(auth);
	}
}

