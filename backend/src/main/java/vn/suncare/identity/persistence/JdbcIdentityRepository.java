package vn.suncare.identity.persistence;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import vn.suncare.common.exception.DomainValidationException;
import vn.suncare.common.exception.ErrorCode;
import vn.suncare.common.exception.ResourceNotFoundException;
import vn.suncare.security.AccountStatus;
import vn.suncare.security.AccountType;
import vn.suncare.security.PermissionCode;
import vn.suncare.security.RoleCode;
import vn.suncare.security.SuncarePrincipal;

@Repository
public class JdbcIdentityRepository implements IdentityRepository {

	private final ObjectProvider<JdbcTemplate> jdbcTemplateProvider;
	private final JdbcTemplate directJdbcTemplate;
	private final Clock clock;

	@Autowired
	public JdbcIdentityRepository(ObjectProvider<JdbcTemplate> jdbcTemplateProvider, Clock clock) {
		this.jdbcTemplateProvider = Objects.requireNonNull(jdbcTemplateProvider, "jdbcTemplateProvider must not be null");
		this.directJdbcTemplate = null;
		this.clock = Objects.requireNonNull(clock, "clock must not be null");
	}

	public JdbcIdentityRepository(JdbcTemplate jdbcTemplate, Clock clock) {
		this.jdbcTemplateProvider = null;
		this.directJdbcTemplate = Objects.requireNonNull(jdbcTemplate, "jdbcTemplate must not be null");
		this.clock = Objects.requireNonNull(clock, "clock must not be null");
	}

	private JdbcTemplate requireJdbc() {
		if (directJdbcTemplate != null) {
			return directJdbcTemplate;
		}
		JdbcTemplate jdbc = jdbcTemplateProvider != null ? jdbcTemplateProvider.getIfAvailable() : null;
		if (jdbc == null) {
			throw new IllegalStateException("JdbcTemplate is not configured in the active profile.");
		}
		return jdbc;
	}

	@Override
	public Optional<AccountCredentialsRecord> findCredentialsByLoginName(String normalizedLoginName) {
		List<AccountCredentialsRecord> rows = requireJdbc().query(
				"""
				SELECT [id], [login_name], [password_hash], [account_type], [status], [patient_id], [staff_id]
				FROM [dbo].[Account]
				WHERE [login_name] = ?
				""",
				(rs, rowNum) -> {
					long patientIdVal = rs.getLong("patient_id");
					Long patientId = rs.wasNull() ? null : patientIdVal;
					long staffIdVal = rs.getLong("staff_id");
					Long staffId = rs.wasNull() ? null : staffIdVal;
					return new AccountCredentialsRecord(
							rs.getLong("id"),
							rs.getString("login_name"),
							rs.getString("password_hash"),
							AccountType.valueOf(rs.getString("account_type")),
							AccountStatus.valueOf(rs.getString("status")),
							patientId,
							staffId
					);
				},
				normalizedLoginName
		);
		return rows.stream().findFirst();
	}

	@Override
	public Optional<AccountCredentialsRecord> findCredentialsByAccountId(long accountId) {
		List<AccountCredentialsRecord> rows = requireJdbc().query(
				"""
				SELECT [id], [login_name], [password_hash], [account_type], [status], [patient_id], [staff_id]
				FROM [dbo].[Account]
				WHERE [id] = ?
				""",
				(rs, rowNum) -> {
					long patientIdVal = rs.getLong("patient_id");
					Long patientId = rs.wasNull() ? null : patientIdVal;
					long staffIdVal = rs.getLong("staff_id");
					Long staffId = rs.wasNull() ? null : staffIdVal;
					return new AccountCredentialsRecord(
							rs.getLong("id"),
							rs.getString("login_name"),
							rs.getString("password_hash"),
							AccountType.valueOf(rs.getString("account_type")),
							AccountStatus.valueOf(rs.getString("status")),
							patientId,
							staffId
					);
				},
				accountId
		);
		return rows.stream().findFirst();
	}

	@Override
	public Optional<SuncarePrincipal> findPrincipalByAccountId(long accountId) {
		JdbcTemplate jdbc = requireJdbc();
		List<AccountRow> accounts = jdbc.query(
				"""
				SELECT
					a.[id],
					a.[login_name],
					a.[account_type],
					a.[status],
					a.[patient_id],
					a.[staff_id],
					COALESCE(p.[code], s.[code]) AS [profile_code],
					COALESCE(p.[full_name], s.[full_name]) AS [full_name],
					COALESCE(p.[is_active], s.[is_active], CAST(0 AS bit)) AS [profile_active]
				FROM [dbo].[Account] a
				LEFT JOIN [dbo].[Patient] p ON p.[id] = a.[patient_id]
				LEFT JOIN [dbo].[Staff] s ON s.[id] = a.[staff_id]
				WHERE a.[id] = ?
				""",
				(rs, rowNum) -> {
					long pVal = rs.getLong("patient_id");
					Long patientId = rs.wasNull() ? null : pVal;
					long sVal = rs.getLong("staff_id");
					Long staffId = rs.wasNull() ? null : sVal;
					return new AccountRow(
							rs.getLong("id"),
							rs.getString("login_name"),
							AccountType.valueOf(rs.getString("account_type")),
							AccountStatus.valueOf(rs.getString("status")),
							rs.getBoolean("profile_active"),
							patientId,
							staffId,
							rs.getString("profile_code"),
							rs.getString("full_name")
					);
				},
				accountId
		);
		if (accounts.isEmpty()) {
			return Optional.empty();
		}
		AccountRow row = accounts.getFirst();

		Set<RoleCode> roles = new LinkedHashSet<>(jdbc.query(
				"""
				SELECT r.[code]
				FROM [dbo].[AccountRole] ar
				JOIN [dbo].[Role] r ON r.[id] = ar.[role_id]
				WHERE ar.[account_id] = ?
				ORDER BY r.[id]
				""",
				(rs, rowNum) -> RoleCode.valueOf(rs.getString("code")),
				accountId
		));

		Set<PermissionCode> permissions = new LinkedHashSet<>(jdbc.query(
				"""
				SELECT DISTINCT p.[code]
				FROM [dbo].[AccountRole] ar
				JOIN [dbo].[RolePermission] rp ON rp.[role_id] = ar.[role_id]
				JOIN [dbo].[Permission] p ON p.[id] = rp.[permission_id]
				WHERE ar.[account_id] = ?
				ORDER BY p.[code]
				""",
				(rs, rowNum) -> PermissionCode.valueOf(rs.getString("code")),
				accountId
		));

		Long primaryDepartmentId = null;
		Set<Long> activeDepartmentIds = new LinkedHashSet<>();
		Set<Long> headDepartmentIds = new LinkedHashSet<>();

		if (row.staffId() != null) {
			Timestamp nowTs = Timestamp.from(Instant.now(clock));
			List<StaffDeptRow> staffDepts = jdbc.query(
					"""
					SELECT [department_id], [is_primary]
					FROM [dbo].[StaffDepartment]
					WHERE [staff_id] = ?
					  AND [valid_from] <= ?
					  AND ([valid_to] IS NULL OR [valid_to] > ?)
					ORDER BY [is_primary] DESC, [id] DESC
					""",
					(rs, rowNum) -> new StaffDeptRow(rs.getLong("department_id"), rs.getBoolean("is_primary")),
					row.staffId(),
					nowTs,
					nowTs
			);
			for (StaffDeptRow sd : staffDepts) {
				activeDepartmentIds.add(sd.departmentId());
				if (sd.primary() && primaryDepartmentId == null) {
					primaryDepartmentId = sd.departmentId();
				}
			}

			headDepartmentIds.addAll(jdbc.query(
					"""
					SELECT [department_id]
					FROM [dbo].[DepartmentHeadAssignment]
					WHERE [staff_id] = ?
					  AND [valid_from] <= ?
					  AND ([valid_to] IS NULL OR [valid_to] > ?)
					ORDER BY [department_id]
					""",
					(rs, rowNum) -> rs.getLong("department_id"),
					row.staffId(),
					nowTs,
					nowTs
			));
		}

		return Optional.of(new SuncarePrincipal(
				row.accountId(),
				row.loginName(),
				row.accountType(),
				row.status(),
				row.profileActive(),
				row.patientId(),
				row.staffId(),
				row.profileCode(),
				row.fullName(),
				roles,
				permissions,
				primaryDepartmentId,
				activeDepartmentIds,
				headDepartmentIds
		));
	}

	@Override
	public boolean existsByLoginName(String normalizedLoginName) {
		Integer count = requireJdbc().queryForObject(
				"SELECT COUNT(*) FROM [dbo].[Account] WHERE [login_name] = ?",
				Integer.class,
				normalizedLoginName
		);
		return count != null && count > 0;
	}

	@Override
	public long insertPatient(
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
			Instant now) {
		Timestamp nowTs = Timestamp.from(now);
		KeyHolder keyHolder = new GeneratedKeyHolder();
		requireJdbc().update(connection -> {
			PreparedStatement ps = connection.prepareStatement(
					"""
					INSERT INTO [dbo].[Patient]
					([code], [full_name], [birth_date], [sex], [phone], [email], [address], [identity_number], [emergency_name], [emergency_phone], [is_active], [created_at], [updated_at])
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
					""",
					Statement.RETURN_GENERATED_KEYS
			);
			ps.setString(1, code);
			ps.setString(2, fullName);
			if (birthDate != null) {
				ps.setDate(3, Date.valueOf(birthDate));
			} else {
				ps.setNull(3, Types.DATE);
			}
			ps.setString(4, sex);
			ps.setString(5, phone);
			ps.setString(6, email);
			ps.setString(7, address);
			ps.setString(8, identityNumber);
			ps.setString(9, emergencyName);
			ps.setString(10, emergencyPhone);
			ps.setTimestamp(11, nowTs);
			ps.setTimestamp(12, nowTs);
			return ps;
		}, keyHolder);
		return Objects.requireNonNull(keyHolder.getKey(), "Generated Patient.id must not be null").longValue();
	}

	@Override
	public long insertStaff(
			String code,
			String fullName,
			LocalDate birthDate,
			String sex,
			String phone,
			String email,
			String address,
			String professionalLicense,
			String qualification,
			Instant now) {
		Timestamp nowTs = Timestamp.from(now);
		KeyHolder keyHolder = new GeneratedKeyHolder();
		requireJdbc().update(connection -> {
			PreparedStatement ps = connection.prepareStatement(
					"""
					INSERT INTO [dbo].[Staff]
					([code], [full_name], [birth_date], [sex], [phone], [email], [address], [professional_license], [qualification], [is_active], [created_at], [updated_at])
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
					""",
					Statement.RETURN_GENERATED_KEYS
			);
			ps.setString(1, code);
			ps.setString(2, fullName);
			if (birthDate != null) {
				ps.setDate(3, Date.valueOf(birthDate));
			} else {
				ps.setNull(3, Types.DATE);
			}
			ps.setString(4, sex);
			ps.setString(5, phone);
			ps.setString(6, email);
			ps.setString(7, address);
			ps.setString(8, professionalLicense);
			ps.setString(9, qualification);
			ps.setTimestamp(10, nowTs);
			ps.setTimestamp(11, nowTs);
			return ps;
		}, keyHolder);
		return Objects.requireNonNull(keyHolder.getKey(), "Generated Staff.id must not be null").longValue();
	}

	@Override
	public long insertAccount(
			String normalizedLoginName,
			String passwordHash,
			AccountType accountType,
			Long patientId,
			Long staffId,
			AccountStatus status,
			Instant now) {
		SuncarePrincipal.validateProfileXor(accountType, patientId, staffId);
		Timestamp nowTs = Timestamp.from(now);
		KeyHolder keyHolder = new GeneratedKeyHolder();
		requireJdbc().update(connection -> {
			PreparedStatement ps = connection.prepareStatement(
					"""
					INSERT INTO [dbo].[Account]
					([login_name], [password_hash], [account_type], [patient_id], [staff_id], [status], [created_at], [updated_at])
					VALUES (?, ?, ?, ?, ?, ?, ?, ?)
					""",
					Statement.RETURN_GENERATED_KEYS
			);
			ps.setString(1, normalizedLoginName);
			ps.setString(2, passwordHash);
			ps.setString(3, accountType.name());
			if (patientId != null) {
				ps.setLong(4, patientId);
			} else {
				ps.setNull(4, Types.BIGINT);
			}
			if (staffId != null) {
				ps.setLong(5, staffId);
			} else {
				ps.setNull(5, Types.BIGINT);
			}
			ps.setString(6, status.name());
			ps.setTimestamp(7, nowTs);
			ps.setTimestamp(8, nowTs);
			return ps;
		}, keyHolder);
		return Objects.requireNonNull(keyHolder.getKey(), "Generated Account.id must not be null").longValue();
	}

	@Override
	public void replaceAccountRoles(
			long accountId,
			AccountType accountType,
			Set<RoleCode> roles,
			long grantedByAccountId,
			Instant now) {
		if (roles == null || roles.isEmpty()) {
			throw new DomainValidationException("Account must have at least one role.");
		}
		for (RoleCode role : roles) {
			if (role.accountType() != accountType) {
				throw new DomainValidationException(
						ErrorCode.ROLE_ACCOUNT_TYPE_MISMATCH,
						"Role " + role + " cannot be assigned to accountType " + accountType);
			}
		}

		JdbcTemplate jdbc = requireJdbc();
		Timestamp nowTs = Timestamp.from(now);
		jdbc.update("DELETE FROM [dbo].[AccountRole] WHERE [account_id] = ?", accountId);

		for (RoleCode roleCode : roles) {
			List<Long> roleIds = jdbc.query(
					"SELECT [id] FROM [dbo].[Role] WHERE [code] = ? AND [account_type] = ?",
					(rs, rowNum) -> rs.getLong("id"),
					roleCode.name(),
					accountType.name()
			);
			if (roleIds.isEmpty()) {
				throw new DomainValidationException(
						ErrorCode.ROLE_ACCOUNT_TYPE_MISMATCH,
						"Role " + roleCode + " is not seeded for accountType " + accountType);
			}
			long roleId = roleIds.getFirst();
			jdbc.update(
					"""
					INSERT INTO [dbo].[AccountRole] ([account_id], [role_id], [granted_by], [granted_at], [created_at], [updated_at])
					VALUES (?, ?, ?, ?, ?, ?)
					""",
					accountId,
					roleId,
					grantedByAccountId,
					nowTs,
					nowTs,
					nowTs
			);
		}
	}

	@Override
	public void updateAccountStatus(long accountId, AccountStatus status, Instant now) {
		Timestamp nowTs = Timestamp.from(now);
		int updated = requireJdbc().update(
				"UPDATE [dbo].[Account] SET [status] = ?, [updated_at] = ? WHERE [id] = ?",
				status.name(),
				nowTs,
				accountId
		);
		if (updated == 0) {
			throw new ResourceNotFoundException("Account not found: id=" + accountId);
		}
	}

	@Override
	public void touchLastLogin(long accountId, Instant now) {
		Timestamp nowTs = Timestamp.from(now);
		requireJdbc().update(
				"UPDATE [dbo].[Account] SET [last_login_at] = ?, [updated_at] = ? WHERE [id] = ?",
				nowTs,
				nowTs,
				accountId
		);
	}

	@Override
	public long assignPrimaryStaffDepartment(
			long staffId,
			long departmentId,
			Instant validFrom,
			Instant now) {
		JdbcTemplate jdbc = requireJdbc();
		Timestamp validFromTs = Timestamp.from(validFrom);
		Timestamp nowTs = Timestamp.from(now);

		jdbc.update(
				"""
				UPDATE [dbo].[StaffDepartment]
				SET [valid_to] = ?, [updated_at] = ?
				WHERE [staff_id] = ? AND [is_primary] = 1 AND [valid_to] IS NULL AND [valid_from] < ?
				""",
				validFromTs,
				nowTs,
				staffId,
				validFromTs
		);

		KeyHolder keyHolder = new GeneratedKeyHolder();
		jdbc.update(connection -> {
			PreparedStatement ps = connection.prepareStatement(
					"""
					INSERT INTO [dbo].[StaffDepartment]
					([staff_id], [department_id], [valid_from], [valid_to], [is_primary], [created_at], [updated_at])
					VALUES (?, ?, ?, NULL, 1, ?, ?)
					""",
					Statement.RETURN_GENERATED_KEYS
			);
			ps.setLong(1, staffId);
			ps.setLong(2, departmentId);
			ps.setTimestamp(3, validFromTs);
			ps.setTimestamp(4, nowTs);
			ps.setTimestamp(5, nowTs);
			return ps;
		}, keyHolder);
		return Objects.requireNonNull(keyHolder.getKey(), "Generated StaffDepartment.id must not be null").longValue();
	}

	@Override
	public long insertDepartmentHeadAssignment(
			long staffId,
			long departmentId,
			Instant validFrom,
			Instant validTo,
			long assignedByAccountId,
			Instant now) {
		if (validTo != null && !validTo.isAfter(validFrom)) {
			throw new DomainValidationException("validTo must be strictly after validFrom.");
		}
		Timestamp validFromTs = Timestamp.from(validFrom);
		Timestamp validToTs = validTo != null ? Timestamp.from(validTo) : null;
		Timestamp nowTs = Timestamp.from(now);

		KeyHolder keyHolder = new GeneratedKeyHolder();
		requireJdbc().update(connection -> {
			PreparedStatement ps = connection.prepareStatement(
					"""
					INSERT INTO [dbo].[DepartmentHeadAssignment]
					([staff_id], [department_id], [valid_from], [valid_to], [assigned_by], [created_at], [updated_at])
					VALUES (?, ?, ?, ?, ?, ?, ?)
					""",
					Statement.RETURN_GENERATED_KEYS
			);
			ps.setLong(1, staffId);
			ps.setLong(2, departmentId);
			ps.setTimestamp(3, validFromTs);
			if (validToTs != null) {
				ps.setTimestamp(4, validToTs);
			} else {
				ps.setNull(4, Types.TIMESTAMP);
			}
			ps.setLong(5, assignedByAccountId);
			ps.setTimestamp(6, nowTs);
			ps.setTimestamp(7, nowTs);
			return ps;
		}, keyHolder);
		return Objects.requireNonNull(keyHolder.getKey(), "Generated DepartmentHeadAssignment.id must not be null").longValue();
	}

	@Override
	public void updatePatientSelfProfile(
			long patientId,
			String fullName,
			String phone,
			String email,
			String address,
			String emergencyName,
			String emergencyPhone,
			Instant now) {
		Timestamp nowTs = Timestamp.from(now);
		requireJdbc().update(
				"""
				UPDATE [dbo].[Patient]
				SET [full_name] = ?,
				    [phone] = ?,
				    [email] = ?,
				    [address] = ?,
				    [emergency_name] = ?,
				    [emergency_phone] = ?,
				    [updated_at] = ?
				WHERE [id] = ?
				""",
				fullName,
				phone,
				email,
				address,
				emergencyName,
				emergencyPhone,
				nowTs,
				patientId
		);
	}

	@Override
	public void updateStaffSelfProfile(
			long staffId,
			String fullName,
			String phone,
			String email,
			String address,
			String qualification,
			Instant now) {
		Timestamp nowTs = Timestamp.from(now);
		requireJdbc().update(
				"""
				UPDATE [dbo].[Staff]
				SET [full_name] = ?,
				    [phone] = ?,
				    [email] = ?,
				    [address] = ?,
				    [qualification] = ?,
				    [updated_at] = ?
				WHERE [id] = ?
				""",
				fullName,
				phone,
				email,
				address,
				qualification,
				nowTs,
				staffId
		);
	}

	@Override
	public void recordAuditEvent(
			Long actorId,
			String actorType,
			String action,
			String entityType,
			long entityId,
			String correlationId,
			String reason,
			String redactedChange,
			Instant now) {
		Timestamp nowTs = Timestamp.from(now);
		requireJdbc().update(
				"""
				INSERT INTO [dbo].[AuditEvent]
				([actor_id], [actor_type], [action], [entity_type], [entity_id], [occurred_at], [correlation_id], [reason], [redacted_change], [created_at])
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				""",
				actorId,
				actorType,
				action,
				entityType,
				entityId,
				nowTs,
				correlationId != null && !correlationId.isBlank() ? correlationId : "system",
				reason,
				redactedChange,
				nowTs
		);
	}

	private record AccountRow(
			long accountId,
			String loginName,
			AccountType accountType,
			AccountStatus status,
			boolean profileActive,
			Long patientId,
			Long staffId,
			String profileCode,
			String fullName
	) {
	}

	private record StaffDeptRow(long departmentId, boolean primary) {
	}
}

