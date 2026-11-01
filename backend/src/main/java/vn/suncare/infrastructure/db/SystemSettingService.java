package vn.suncare.infrastructure.db;

import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.suncare.common.exception.DomainValidationException;

/**
 * Provides safe access to whitelisted dbo.SystemSetting keys with deterministic defaults
 * before bootstrap (CLS_VALIDITY_DAYS = 10, ONLINE_HOLD_SECONDS = 300).
 */
@Service
public class SystemSettingService {

	public static final String KEY_CLS_VALIDITY_DAYS = "CLS_VALIDITY_DAYS";
	public static final String KEY_ONLINE_HOLD_SECONDS = "ONLINE_HOLD_SECONDS";
	public static final int DEFAULT_CLS_VALIDITY_DAYS = 10;
	public static final int DEFAULT_ONLINE_HOLD_SECONDS = 300;

	private static final Set<String> ALLOWED_KEYS = Set.of(
			KEY_CLS_VALIDITY_DAYS,
			KEY_ONLINE_HOLD_SECONDS
	);

	private final ObjectProvider<JdbcTemplate> jdbcTemplateProvider;
	private final Clock clock;

	public SystemSettingService(ObjectProvider<JdbcTemplate> jdbcTemplateProvider, Clock clock) {
		this.jdbcTemplateProvider = Objects.requireNonNull(jdbcTemplateProvider, "jdbcTemplateProvider must not be null");
		this.clock = Objects.requireNonNull(clock, "clock must not be null");
	}

	public int getClsValidityDays() {
		return readPositiveIntSetting(KEY_CLS_VALIDITY_DAYS, DEFAULT_CLS_VALIDITY_DAYS);
	}

	public int getOnlineHoldSeconds() {
		return readPositiveIntSetting(KEY_ONLINE_HOLD_SECONDS, DEFAULT_ONLINE_HOLD_SECONDS);
	}

	@Transactional
	public void upsertSetting(String key, String value, long changedByAccountId) {
		if (!ALLOWED_KEYS.contains(key)) {
			throw new DomainValidationException("Unsupported SystemSetting key: " + key);
		}
		int parsed;
		try {
			parsed = Integer.parseInt(value.trim());
		} catch (NumberFormatException ex) {
			throw new DomainValidationException("SystemSetting " + key + " must be a positive integer.");
		}
		if (parsed <= 0) {
			throw new DomainValidationException("SystemSetting " + key + " must be > 0.");
		}

		JdbcTemplate jdbc = jdbcTemplateProvider.getIfAvailable();
		if (jdbc == null) {
			throw new IllegalStateException("JdbcTemplate is not available to persist SystemSetting.");
		}

		Timestamp nowTs = Timestamp.from(Instant.now(clock));
		int updated = jdbc.update(
				"""
				UPDATE [dbo].[SystemSetting]
				SET [setting_value] = ?, [changed_by] = ?, [updated_at] = ?
				WHERE [setting_key] = ?
				""",
				String.valueOf(parsed),
				changedByAccountId,
				nowTs,
				key
		);
		if (updated == 0) {
			jdbc.update(
					"""
					INSERT INTO [dbo].[SystemSetting] ([setting_key], [setting_value], [changed_by], [created_at], [updated_at])
					VALUES (?, ?, ?, ?, ?)
					""",
					key,
					String.valueOf(parsed),
					changedByAccountId,
					nowTs,
					nowTs
			);
		}
	}

	private int readPositiveIntSetting(String key, int fallbackDefault) {
		JdbcTemplate jdbc = jdbcTemplateProvider.getIfAvailable();
		if (jdbc == null) {
			return fallbackDefault;
		}
		List<String> values = jdbc.query(
				"SELECT [setting_value] FROM [dbo].[SystemSetting] WHERE [setting_key] = ?",
				(rs, rowNum) -> rs.getString("setting_value"),
				key
		);
		if (values.isEmpty() || values.getFirst() == null) {
			return fallbackDefault;
		}
		int parsed = Integer.parseInt(values.getFirst().trim());
		return parsed > 0 ? parsed : fallbackDefault;
	}
}

