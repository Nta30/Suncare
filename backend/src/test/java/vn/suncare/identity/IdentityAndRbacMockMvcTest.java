package vn.suncare.identity;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.json.JsonMapper;
import vn.suncare.common.exception.DomainValidationException;
import vn.suncare.common.idempotency.CommandReceiptRecord;
import vn.suncare.common.idempotency.CommandReceiptStore;
import vn.suncare.identity.persistence.AccountCredentialsRecord;
import vn.suncare.identity.persistence.IdentityRepository;
import vn.suncare.security.AccountStatus;
import vn.suncare.security.AccountType;
import vn.suncare.security.PermissionCode;
import vn.suncare.security.RoleCode;
import vn.suncare.security.SuncarePrincipal;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class IdentityAndRbacMockMvcTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JsonMapper jsonMapper;

	@Autowired
	private InMemoryIdentityTestStore testStore;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@BeforeEach
	void setUp() {
		testStore.reset(passwordEncoder);
	}

	@Test
	void at01_publicRegistrationRejectsRoleDoctorOrStaffIdAndCreatesOnlyPatient() throws Exception {
		// AT01: Sending role="DOCTOR" is rejected with 422 FORBIDDEN_REGISTRATION_FIELD
		mockMvc.perform(post("/api/v1/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
									"loginName": "attacker@suncare.local",
									"password": "Password#1234",
									"fullName": "Attacker",
									"role": "DOCTOR"
								}
								"""))
				.andExpect(status().isUnprocessableContent())
				.andExpect(jsonPath("$.code").value("FORBIDDEN_REGISTRATION_FIELD"));

		// AT01: Sending staff_id is rejected with 422 FORBIDDEN_REGISTRATION_FIELD
		mockMvc.perform(post("/api/v1/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
									"loginName": "attacker2@suncare.local",
									"password": "Password#1234",
									"fullName": "Attacker Two",
									"staff_id": 50
								}
								"""))
				.andExpect(status().isUnprocessableContent())
				.andExpect(jsonPath("$.code").value("FORBIDDEN_REGISTRATION_FIELD"));

		// Valid registration creates PATIENT account with PATIENT role only
		mockMvc.perform(post("/api/v1/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
									"loginName": "patient.one@suncare.local",
									"password": "Password#1234",
									"fullName": "Nguyen Van A",
									"sex": "MALE",
									"phone": "0901234567"
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.accountType").value("PATIENT"))
				.andExpect(jsonPath("$.patientId").isNumber())
				.andExpect(jsonPath("$.staffId").isEmpty())
				.andExpect(jsonPath("$.roles[0]").value("PATIENT"));
	}

	@Test
	void at02_enforcesAccountProfileXorAndRoleAccountTypeMatch() throws Exception {
		// AT02: SuncarePrincipal rejects both patientId and staffId non-null
		assertThatThrownBy(() -> new SuncarePrincipal(
				10L,
				"invalid@suncare.local",
				AccountType.PATIENT,
				AccountStatus.ACTIVE,
				true,
				100L,
				200L,
				"PAT-100",
				"Invalid Both",
				Set.of(RoleCode.PATIENT),
				Set.of(),
				null,
				Set.of(),
				Set.of()
		)).isInstanceOf(DomainValidationException.class)
				.hasMessageContaining("PATIENT account must link to exactly one patient_id and null staff_id");

		// AT02: SuncarePrincipal rejects neither patientId nor staffId
		assertThatThrownBy(() -> new SuncarePrincipal(
				11L,
				"invalid2@suncare.local",
				AccountType.STAFF,
				AccountStatus.ACTIVE,
				true,
				null,
				null,
				"STF-100",
				"Invalid Neither",
				Set.of(RoleCode.DOCTOR),
				Set.of(),
				null,
				Set.of(),
				Set.of()
		)).isInstanceOf(DomainValidationException.class)
				.hasMessageContaining("STAFF account must link to exactly one staff_id and null patient_id");

		String adminToken = loginAndGetToken("sysadmin@suncare.local", "AdminPass#2026");

		// AT02 via HTTP: provisioning STAFF account with patient_id is rejected
		mockMvc.perform(post("/api/v1/admin/staff-accounts")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
									"loginName": "bad.staff@suncare.local",
									"password": "StaffPass#2026",
									"fullName": "Bad Staff",
									"roles": ["DOCTOR"],
									"patient_id": 999
								}
								"""))
				.andExpect(status().isUnprocessableContent())
				.andExpect(jsonPath("$.code").value("ACCOUNT_PROFILE_XOR_VIOLATION"));

		// DB-02 via HTTP: provisioning STAFF account with PATIENT role is rejected
		mockMvc.perform(post("/api/v1/admin/staff-accounts")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
									"loginName": "mismatch.staff@suncare.local",
									"password": "StaffPass#2026",
									"fullName": "Mismatch Staff",
									"roles": ["PATIENT"]
								}
								"""))
				.andExpect(status().isUnprocessableContent())
				.andExpect(jsonPath("$.code").value("ROLE_ACCOUNT_TYPE_MISMATCH"));
	}

	@Test
	void at03_multiRoleDoctorAndDepartmentHeadScopedToOwnDepartmentAndImmediateRevocation() throws Exception {
		String adminToken = loginAndGetToken("sysadmin@suncare.local", "AdminPass#2026");

		// Provision staff with both DOCTOR and DEPARTMENT_HEAD for department 10
		MvcResult provisionRes = mockMvc.perform(post("/api/v1/admin/staff-accounts")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
						.header("Idempotency-Key", "prov-doc-head-01")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
									"loginName": "dr.head@suncare.local",
									"password": "DoctorPass#2026",
									"staffCode": "DOC-001",
									"fullName": "BS Truong Khoa Noi",
									"roles": ["DOCTOR", "DEPARTMENT_HEAD"],
									"primaryDepartmentId": 10,
									"headDepartmentId": 10
								}
								"""))
				.andExpect(status().isCreated())
				.andReturn();

		long staffAccountId = jsonMapper.readTree(provisionRes.getResponse().getContentAsString()).get("accountId").asLong();
		long staffId = jsonMapper.readTree(provisionRes.getResponse().getContentAsString()).get("staffId").asLong();

		String drHeadToken = loginAndGetToken("dr.head@suncare.local", "DoctorPass#2026");

		// AT03: Allowed to publish schedule in own department (10)
		mockMvc.perform(get("/api/v1/identity/scope-check/departments/10/schedule-publish")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + drHeadToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.allowed").value(true));

		// AT03: Denied in another department (20)
		mockMvc.perform(get("/api/v1/identity/scope-check/departments/20/schedule-publish")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + drHeadToken))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("FORBIDDEN"));

		// AT03: Allowed as assigned doctor for own staffId
		mockMvc.perform(get("/api/v1/identity/scope-check/doctors/" + staffId + "/encounters")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + drHeadToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.allowed").value(true));

		// AT03: Denied for another doctor's staffId (999)
		mockMvc.perform(get("/api/v1/identity/scope-check/doctors/999/encounters")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + drHeadToken))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("FORBIDDEN"));

		// Revoke DEPARTMENT_HEAD role, keeping only DOCTOR -> takes effect on very next request
		mockMvc.perform(put("/api/v1/admin/accounts/" + staffAccountId + "/roles")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
									"roles": ["DOCTOR"],
									"reason": "End of department head term"
								}
								"""))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/v1/identity/scope-check/departments/10/schedule-publish")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + drHeadToken))
				.andExpect(status().isForbidden());

		// Lock account -> takes effect on very next request with 403 ACCOUNT_LOCKED
		mockMvc.perform(patch("/api/v1/admin/accounts/" + staffAccountId + "/status")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
									"status": "LOCKED",
									"reason": "Security lock test"
								}
								"""))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/v1/auth/me")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + drHeadToken))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("ACCOUNT_LOCKED"));
	}

	@Test
	void at45_idempotencyKeyReplaysSameRegistrationAndConflictsOnModifiedPayload() throws Exception {
		String body1 = """
				{
					"loginName": "idem.patient@suncare.local",
					"password": "Password#1234",
					"fullName": "Tran Thi B",
					"sex": "FEMALE"
				}
				""";

		MvcResult first = mockMvc.perform(post("/api/v1/auth/register")
						.header("Idempotency-Key", "reg-key-100")
						.contentType(MediaType.APPLICATION_JSON)
						.content(body1))
				.andExpect(status().isCreated())
				.andReturn();
		long firstAccountId = jsonMapper.readTree(first.getResponse().getContentAsString()).get("accountId").asLong();

		// Retry with same Idempotency-Key and same payload -> replays same accountId
		MvcResult replay = mockMvc.perform(post("/api/v1/auth/register")
						.header("Idempotency-Key", "reg-key-100")
						.contentType(MediaType.APPLICATION_JSON)
						.content(body1))
				.andExpect(status().isCreated())
				.andReturn();
		long replayAccountId = jsonMapper.readTree(replay.getResponse().getContentAsString()).get("accountId").asLong();
		org.assertj.core.api.Assertions.assertThat(replayAccountId).isEqualTo(firstAccountId);

		// Retry with same Idempotency-Key and different payload -> 409 IDEMPOTENCY_CONFLICT
		mockMvc.perform(post("/api/v1/auth/register")
						.header("Idempotency-Key", "reg-key-100")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
									"loginName": "idem.patient@suncare.local",
									"password": "Password#1234",
									"fullName": "Different Name",
									"sex": "FEMALE"
								}
								"""))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.code").value("IDEMPOTENCY_CONFLICT"));
	}

	private String loginAndGetToken(String loginName, String password) throws Exception {
		MvcResult res = mockMvc.perform(post("/api/v1/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"loginName\":\"" + loginName + "\",\"password\":\"" + password + "\"}"))
				.andExpect(status().isOk())
				.andReturn();
		return jsonMapper.readTree(res.getResponse().getContentAsString()).get("accessToken").asText();
	}

	@TestConfiguration
	static class TestIdentityConfig {

		@Bean
		@Primary
		InMemoryIdentityTestStore inMemoryIdentityTestStore() {
			return new InMemoryIdentityTestStore();
		}
	}

	static class InMemoryIdentityTestStore implements IdentityRepository, CommandReceiptStore {

		private final AtomicLong seq = new AtomicLong(1L);
		private final Map<Long, SuncarePrincipal> principals = new ConcurrentHashMap<>();
		private final Map<Long, String> passwordHashes = new ConcurrentHashMap<>();
		private final Map<String, CommandReceiptRecord> receipts = new ConcurrentHashMap<>();

		void reset(PasswordEncoder encoder) {
			seq.set(1L);
			principals.clear();
			passwordHashes.clear();
			receipts.clear();

			long adminAccountId = seq.getAndIncrement();
			long adminStaffId = seq.getAndIncrement();
			passwordHashes.put(adminAccountId, encoder.encode("AdminPass#2026"));
			principals.put(adminAccountId, new SuncarePrincipal(
					adminAccountId,
					"sysadmin@suncare.local",
					AccountType.STAFF,
					AccountStatus.ACTIVE,
					true,
					null,
					adminStaffId,
					"ADM-001",
					"System Admin",
					Set.of(RoleCode.SYSTEM_ADMIN),
					permissionsForRoles(Set.of(RoleCode.SYSTEM_ADMIN)),
					null,
					Set.of(),
					Set.of()
			));
		}

		@Override
		public Optional<AccountCredentialsRecord> findCredentialsByLoginName(String normalizedLoginName) {
			return principals.values().stream()
					.filter(p -> p.loginName().equals(normalizedLoginName))
					.findFirst()
					.map(p -> new AccountCredentialsRecord(
							p.accountId(),
							p.loginName(),
							passwordHashes.get(p.accountId()),
							p.accountType(),
							p.status(),
							p.patientId(),
							p.staffId()
					));
		}

		@Override
		public Optional<AccountCredentialsRecord> findCredentialsByAccountId(long accountId) {
			SuncarePrincipal p = principals.get(accountId);
			if (p == null) {
				return Optional.empty();
			}
			return Optional.of(new AccountCredentialsRecord(
					p.accountId(),
					p.loginName(),
					passwordHashes.get(p.accountId()),
					p.accountType(),
					p.status(),
					p.patientId(),
					p.staffId()
			));
		}

		@Override
		public Optional<SuncarePrincipal> findPrincipalByAccountId(long accountId) {
			return Optional.ofNullable(principals.get(accountId));
		}

		@Override
		public boolean existsByLoginName(String normalizedLoginName) {
			return principals.values().stream().anyMatch(p -> p.loginName().equals(normalizedLoginName));
		}

		private final Map<Long, String> pendingCodes = new ConcurrentHashMap<>();
		private final Map<Long, String> pendingNames = new ConcurrentHashMap<>();

		@Override
		public long insertPatient(String code, String fullName, LocalDate birthDate, String sex, String phone, String email, String address, String identityNumber, String emergencyName, String emergencyPhone, Instant now) {
			long id = seq.getAndIncrement();
			pendingCodes.put(id, code);
			pendingNames.put(id, fullName);
			return id;
		}

		@Override
		public long insertStaff(String code, String fullName, LocalDate birthDate, String sex, String phone, String email, String address, String professionalLicense, String qualification, Instant now) {
			long id = seq.getAndIncrement();
			pendingCodes.put(id, code);
			pendingNames.put(id, fullName);
			return id;
		}

		@Override
		public long insertAccount(String normalizedLoginName, String passwordHash, AccountType accountType, Long patientId, Long staffId, AccountStatus status, Instant now) {
			SuncarePrincipal.validateProfileXor(accountType, patientId, staffId);
			long accountId = seq.getAndIncrement();
			Long profileId = patientId != null ? patientId : staffId;
			passwordHashes.put(accountId, passwordHash);
			principals.put(accountId, new SuncarePrincipal(
					accountId,
					normalizedLoginName,
					accountType,
					status,
					true,
					patientId,
					staffId,
					pendingCodes.getOrDefault(profileId, "CODE-" + profileId),
					pendingNames.getOrDefault(profileId, "User " + profileId),
					Set.of(),
					Set.of(),
					null,
					Set.of(),
					Set.of()
			));
			return accountId;
		}

		@Override
		public void replaceAccountRoles(long accountId, AccountType accountType, Set<RoleCode> roles, long grantedByAccountId, Instant now) {
			for (RoleCode role : roles) {
				if (role.accountType() != accountType) {
					throw new DomainValidationException(
							vn.suncare.common.exception.ErrorCode.ROLE_ACCOUNT_TYPE_MISMATCH,
							"Role mismatch");
				}
			}
			SuncarePrincipal current = principals.get(accountId);
			principals.put(accountId, new SuncarePrincipal(
					current.accountId(),
					current.loginName(),
					current.accountType(),
					current.status(),
					current.profileActive(),
					current.patientId(),
					current.staffId(),
					current.profileCode(),
					current.fullName(),
					roles,
					permissionsForRoles(roles),
					current.primaryDepartmentId(),
					current.activeDepartmentIds(),
					current.headDepartmentIds()
			));
		}

		@Override
		public void updateAccountStatus(long accountId, AccountStatus status, Instant now) {
			SuncarePrincipal current = principals.get(accountId);
			principals.put(accountId, new SuncarePrincipal(
					current.accountId(),
					current.loginName(),
					current.accountType(),
					status,
					current.profileActive(),
					current.patientId(),
					current.staffId(),
					current.profileCode(),
					current.fullName(),
					current.roles(),
					current.permissions(),
					current.primaryDepartmentId(),
					current.activeDepartmentIds(),
					current.headDepartmentIds()
			));
		}

		@Override
		public void touchLastLogin(long accountId, Instant now) {
		}

		@Override
		public long assignPrimaryStaffDepartment(long staffId, long departmentId, Instant validFrom, Instant now) {
			principals.values().stream()
					.filter(p -> Objects.equals(p.staffId(), staffId))
					.findFirst()
					.ifPresent(current -> {
						Set<Long> depts = new LinkedHashSet<>(current.activeDepartmentIds());
						depts.add(departmentId);
						principals.put(current.accountId(), new SuncarePrincipal(
								current.accountId(),
								current.loginName(),
								current.accountType(),
								current.status(),
								current.profileActive(),
								current.patientId(),
								current.staffId(),
								current.profileCode(),
								current.fullName(),
								current.roles(),
								current.permissions(),
								departmentId,
								depts,
								current.headDepartmentIds()
						));
					});
			return seq.getAndIncrement();
		}

		@Override
		public long insertDepartmentHeadAssignment(long staffId, long departmentId, Instant validFrom, Instant validTo, long assignedByAccountId, Instant now) {
			principals.values().stream()
					.filter(p -> Objects.equals(p.staffId(), staffId))
					.findFirst()
					.ifPresent(current -> {
						Set<Long> heads = new LinkedHashSet<>(current.headDepartmentIds());
						heads.add(departmentId);
						principals.put(current.accountId(), new SuncarePrincipal(
								current.accountId(),
								current.loginName(),
								current.accountType(),
								current.status(),
								current.profileActive(),
								current.patientId(),
								current.staffId(),
								current.profileCode(),
								current.fullName(),
								current.roles(),
								current.permissions(),
								current.primaryDepartmentId(),
								current.activeDepartmentIds(),
								heads
						));
					});
			return seq.getAndIncrement();
		}

		@Override
		public void updatePatientSelfProfile(long patientId, String fullName, String phone, String email, String address, String emergencyName, String emergencyPhone, Instant now) {
		}

		@Override
		public void updateStaffSelfProfile(long staffId, String fullName, String phone, String email, String address, String qualification, Instant now) {
		}

		@Override
		public void recordAuditEvent(Long actorId, String actorType, String action, String entityType, long entityId, String correlationId, String reason, String redactedChange, Instant now) {
		}

		@Override
		public Optional<CommandReceiptRecord> findByCommandTypeAndScopedKey(String commandType, String scopedIdempotencyKey) {
			return Optional.ofNullable(receipts.get(commandType + "|" + scopedIdempotencyKey));
		}

		@Override
		public CommandReceiptRecord insert(Long accountId, String commandType, String scopedIdempotencyKey, String requestHash, String resourceType, long resourceId, Instant createdAt) {
			CommandReceiptRecord record = new CommandReceiptRecord(
					seq.getAndIncrement(),
					accountId,
					commandType,
					scopedIdempotencyKey,
					requestHash,
					resourceType,
					resourceId,
					createdAt
			);
			receipts.put(commandType + "|" + scopedIdempotencyKey, record);
			return record;
		}

		private static Set<PermissionCode> permissionsForRoles(Set<RoleCode> roles) {
			EnumSet<PermissionCode> perms = EnumSet.noneOf(PermissionCode.class);
			for (RoleCode role : roles) {
				switch (role) {
					case PATIENT -> perms.addAll(Set.of(
							PermissionCode.APPOINTMENT_CREATE_SELF,
							PermissionCode.APPOINTMENT_CANCEL_SELF,
							PermissionCode.PROFILE_EDIT_SELF,
							PermissionCode.EMR_READ_SELF
					));
					case DOCTOR -> perms.addAll(Set.of(
							PermissionCode.PROFILE_EDIT_SELF,
							PermissionCode.ENCOUNTER_WRITE_ASSIGNED,
							PermissionCode.EMR_READ_ASSIGNED,
							PermissionCode.RESULT_REVIEW_ASSIGNED,
							PermissionCode.ORDER_MANAGE_ASSIGNED,
							PermissionCode.INVOICE_ISSUE_ASSIGNED,
							PermissionCode.SCHEDULE_READ_SELF,
							PermissionCode.REPORT_EXPORT_SELF
					));
					case LAB_STAFF -> perms.addAll(Set.of(
							PermissionCode.PROFILE_EDIT_SELF,
							PermissionCode.RESULT_WRITE_ASSIGNED,
							PermissionCode.SCHEDULE_READ_SELF
					));
					case DEPARTMENT_HEAD -> perms.addAll(Set.of(
							PermissionCode.PROFILE_EDIT_SELF,
							PermissionCode.SCHEDULE_READ_SELF,
							PermissionCode.SCHEDULE_PUBLISH_DEPARTMENT,
							PermissionCode.REPORT_EXPORT_DEPARTMENT
					));
					case CASHIER -> perms.addAll(Set.of(
							PermissionCode.PROFILE_EDIT_SELF,
							PermissionCode.CASH_RECEIVE,
							PermissionCode.REFUND_PROCESS,
							PermissionCode.REPORT_EXPORT_BILLING
					));
					case SYSTEM_ADMIN -> perms.addAll(Set.of(
							PermissionCode.PROFILE_EDIT_SELF,
							PermissionCode.ACCOUNT_MANAGE,
							PermissionCode.CATALOG_MANAGE,
							PermissionCode.REPORT_EXPORT_ALL
					));
				}
			}
			return perms;
		}
	}
}
