package vn.suncare.infrastructure.db;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Controlled, idempotent initial admin & SystemSetting bootstrap per database/README.md:
 * Staff -> Account(STAFF) -> AccountRole(SYSTEM_ADMIN, granted_by=self) + SystemSetting defaults + AuditEvent.
 */
@Service
public class AdminSettingsBootstrapService {

	public record BootstrapOutcome(
			long adminAccountId,
			boolean createdNewAdmin,
			int clsValidityDays,
			int onlineHoldSeconds
	) {
	}

	private final ObjectProvider<JdbcTemplate> jdbcTemplateProvider;
	private final JdbcTemplate directJdbcTemplate;
	private final PasswordEncoder passwordEncoder;
	private final SystemSettingService systemSettingService;
	private final Clock clock;

	@Autowired
	public AdminSettingsBootstrapService(
			ObjectProvider<JdbcTemplate> jdbcTemplateProvider,
			PasswordEncoder passwordEncoder,
			SystemSettingService systemSettingService,
			Clock clock) {
		this.jdbcTemplateProvider = Objects.requireNonNull(jdbcTemplateProvider, "jdbcTemplateProvider must not be null");
		this.directJdbcTemplate = null;
		this.passwordEncoder = Objects.requireNonNull(passwordEncoder, "passwordEncoder must not be null");
		this.systemSettingService = Objects.requireNonNull(systemSettingService, "systemSettingService must not be null");
		this.clock = Objects.requireNonNull(clock, "clock must not be null");
	}

	public AdminSettingsBootstrapService(
			JdbcTemplate jdbcTemplate,
			PasswordEncoder passwordEncoder,
			SystemSettingService systemSettingService,
			Clock clock) {
		this.jdbcTemplateProvider = null;
		this.directJdbcTemplate = Objects.requireNonNull(jdbcTemplate, "jdbcTemplate must not be null");
		this.passwordEncoder = Objects.requireNonNull(passwordEncoder, "passwordEncoder must not be null");
		this.systemSettingService = Objects.requireNonNull(systemSettingService, "systemSettingService must not be null");
		this.clock = Objects.requireNonNull(clock, "clock must not be null");
	}

	private JdbcTemplate requireJdbcTemplate() {
		if (directJdbcTemplate != null) {
			return directJdbcTemplate;
		}
		JdbcTemplate jdbc = jdbcTemplateProvider != null ? jdbcTemplateProvider.getIfAvailable() : null;
		if (jdbc == null) {
			throw new IllegalStateException("JdbcTemplate is not configured in the current profile.");
		}
		return jdbc;
	}

	@Transactional
	public BootstrapOutcome bootstrapAdminAndDefaultSettings(BootstrapProperties props) {
		String login = normalizeRequired(props.getAdminLogin(), "suncare.bootstrap.admin-login").toLowerCase(Locale.ROOT);
		String rawPassword = validatePassword(props.getAdminPassword());
		String staffCode = normalizeRequired(props.getAdminStaffCode(), "suncare.bootstrap.admin-staff-code");
		String fullName = normalizeRequired(props.getAdminFullName(), "suncare.bootstrap.admin-full-name");

		JdbcTemplate jdbcTemplate = requireJdbcTemplate();
		Instant now = Instant.now(clock);
		Timestamp nowTs = Timestamp.from(now);

		List<Long> existingIds = jdbcTemplate.query(
				"SELECT [id] FROM [dbo].[Account] WHERE [login_name] = ?",
				(rs, rowNum) -> rs.getLong("id"),
				login
		);

		final long adminAccountId;
		final boolean createdNewAdmin;

		if (!existingIds.isEmpty()) {
			adminAccountId = existingIds.getFirst();
			createdNewAdmin = false;
		} else {
			long staffId = insertStaff(jdbcTemplate, staffCode, fullName, nowTs);
			String passwordHash = passwordEncoder.encode(rawPassword);
			adminAccountId = insertStaffAccount(jdbcTemplate, login, passwordHash, staffId, nowTs);
			createdNewAdmin = true;
		}

		long systemAdminRoleId = findSystemAdminRoleId(jdbcTemplate);
		ensureAdminRoleGranted(jdbcTemplate, adminAccountId, systemAdminRoleId, nowTs);
		ensureSettingIfMissing(
				jdbcTemplate,
				SystemSettingService.KEY_CLS_VALIDITY_DAYS,
				String.valueOf(SystemSettingService.DEFAULT_CLS_VALIDITY_DAYS),
				adminAccountId
		);
		ensureSettingIfMissing(
				jdbcTemplate,
				SystemSettingService.KEY_ONLINE_HOLD_SECONDS,
				String.valueOf(SystemSettingService.DEFAULT_ONLINE_HOLD_SECONDS),
				adminAccountId
		);

		insertAuditEvent(jdbcTemplate, adminAccountId, createdNewAdmin, nowTs);

		return new BootstrapOutcome(
				adminAccountId,
				createdNewAdmin,
				systemSettingService.getClsValidityDays(),
				systemSettingService.getOnlineHoldSeconds()
		);
	}

	private long insertStaff(JdbcTemplate jdbcTemplate, String staffCode, String fullName, Timestamp nowTs) {
		List<Long> existingStaff = jdbcTemplate.query(
				"SELECT [id] FROM [dbo].[Staff] WHERE [code] = ?",
				(rs, rowNum) -> rs.getLong("id"),
				staffCode
		);
		if (!existingStaff.isEmpty()) {
			return existingStaff.getFirst();
		}

		KeyHolder keyHolder = new GeneratedKeyHolder();
		jdbcTemplate.update(connection -> {
			PreparedStatement ps = connection.prepareStatement(
					"""
					INSERT INTO [dbo].[Staff] ([code], [full_name], [sex], [is_active], [created_at], [updated_at])
					VALUES (?, ?, 'UNKNOWN', 1, ?, ?)
					""",
					Statement.RETURN_GENERATED_KEYS
			);
			ps.setString(1, staffCode);
			ps.setString(2, fullName);
			ps.setTimestamp(3, nowTs);
			ps.setTimestamp(4, nowTs);
			return ps;
		}, keyHolder);
		return Objects.requireNonNull(keyHolder.getKey(), "Generated Staff.id must not be null").longValue();
	}

	private long insertStaffAccount(JdbcTemplate jdbcTemplate, String login, String passwordHash, long staffId, Timestamp nowTs) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		jdbcTemplate.update(connection -> {
			PreparedStatement ps = connection.prepareStatement(
					"""
					INSERT INTO [dbo].[Account]
					([login_name], [password_hash], [account_type], [patient_id], [staff_id], [status], [created_at], [updated_at])
					VALUES (?, ?, 'STAFF', NULL, ?, 'ACTIVE', ?, ?)
					""",
					Statement.RETURN_GENERATED_KEYS
			);
			ps.setString(1, login);
			ps.setString(2, passwordHash);
			ps.setLong(3, staffId);
			ps.setTimestamp(4, nowTs);
			ps.setTimestamp(5, nowTs);
			return ps;
		}, keyHolder);
		return Objects.requireNonNull(keyHolder.getKey(), "Generated Account.id must not be null").longValue();
	}

	private long findSystemAdminRoleId(JdbcTemplate jdbcTemplate) {
		List<Long> roleIds = jdbcTemplate.query(
				"SELECT [id] FROM [dbo].[Role] WHERE [code] = 'SYSTEM_ADMIN' AND [account_type] = 'STAFF'",
				(rs, rowNum) -> rs.getLong("id")
		);
		if (roleIds.isEmpty()) {
			throw new IllegalStateException("SYSTEM_ADMIN role not found in dbo.Role; run 02_seed_rbac.sql first.");
		}
		return roleIds.getFirst();
	}

	private void ensureAdminRoleGranted(JdbcTemplate jdbcTemplate, long adminAccountId, long roleId, Timestamp nowTs) {
		Integer count = jdbcTemplate.queryForObject(
				"SELECT COUNT(*) FROM [dbo].[AccountRole] WHERE [account_id] = ? AND [role_id] = ?",
				Integer.class,
				adminAccountId,
				roleId
		);
		if (count == null || count == 0) {
			jdbcTemplate.update(
					"""
					INSERT INTO [dbo].[AccountRole] ([account_id], [role_id], [granted_by], [granted_at], [created_at], [updated_at])
					VALUES (?, ?, ?, ?, ?, ?)
					""",
					adminAccountId,
					roleId,
					adminAccountId,
					nowTs,
					nowTs,
					nowTs
			);
		}
	}

	private void ensureSettingIfMissing(JdbcTemplate jdbcTemplate, String key, String defaultValue, long adminAccountId) {
		Integer count = jdbcTemplate.queryForObject(
				"SELECT COUNT(*) FROM [dbo].[SystemSetting] WHERE [setting_key] = ?",
				Integer.class,
				key
		);
		if (count == null || count == 0) {
			systemSettingService.upsertSetting(key, defaultValue, adminAccountId);
		}
	}

	private void insertAuditEvent(JdbcTemplate jdbcTemplate, long adminAccountId, boolean createdNewAdmin, Timestamp nowTs) {
		jdbcTemplate.update(
				"""
				INSERT INTO [dbo].[AuditEvent]
				([actor_id], [actor_type], [action], [entity_type], [entity_id], [occurred_at], [correlation_id], [reason], [redacted_change], [created_at])
				VALUES (?, 'SYSTEM', ?, 'Account', ?, ?, ?, 'Controlled initial admin and SystemSetting bootstrap', NULL, ?)
				""",
				adminAccountId,
				createdNewAdmin ? "BOOTSTRAP_ADMIN_CREATED" : "BOOTSTRAP_ADMIN_VERIFIED",
				adminAccountId,
				nowTs,
				"bootstrap-" + UUID.randomUUID(),
				nowTs
		);
	}

	private static String normalizeRequired(String value, String propertyName) {
		if (value == null || value.trim().isEmpty()) {
			throw new IllegalArgumentException("Required bootstrap property is missing: " + propertyName);
		}
		return value.trim();
	}

	private static String validatePassword(String rawPassword) {
		if (rawPassword == null || rawPassword.length() < 12) {
			throw new IllegalArgumentException(
					"suncare.bootstrap.admin-password must be provided via environment and be at least 12 characters.");
		}
		return rawPassword;
	}
}
