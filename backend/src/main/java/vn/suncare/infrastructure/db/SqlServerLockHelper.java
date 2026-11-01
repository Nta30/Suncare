package vn.suncare.infrastructure.db;

import java.sql.CallableStatement;
import java.sql.Statement;
import java.sql.Types;
import java.util.Objects;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import vn.suncare.common.exception.ConflictException;
import vn.suncare.common.exception.ErrorCode;

/**
 * Acquires transaction-owned SQL Server application locks via sp_getapplock
 * following the canonical lock hierarchy in docs/05-giao-dich-rang-buoc.md.
 */
@Component
public class SqlServerLockHelper {

	public enum LockTier {
		SCHEDULE_SCOPE(1, "SCHED"),
		RESOURCE_ASSIGNMENT_SLOT_HOLD(2, "RES"),
		APPOINTMENT_ENCOUNTER(3, "VISIT"),
		CLINICAL_ORDER(4, "ORDER"),
		INVOICE_LINE(5, "INVOICE"),
		PAYMENT_REFUND(6, "FINANCE");

		private final int order;
		private final String prefix;

		LockTier(int order, String prefix) {
			this.order = order;
			this.prefix = prefix;
		}

		public int order() {
			return order;
		}

		public String formatResource(String key) {
			if (key == null || key.isBlank()) {
				throw new IllegalArgumentException("Lock key must not be blank");
			}
			return prefix + ":" + key.trim();
		}
	}

	private final ObjectProvider<JdbcTemplate> jdbcTemplateProvider;
	private final JdbcTemplate directJdbcTemplate;
	private final DatabaseProperties properties;

	@Autowired
	public SqlServerLockHelper(
			ObjectProvider<JdbcTemplate> jdbcTemplateProvider,
			DatabaseProperties properties) {
		this.jdbcTemplateProvider = Objects.requireNonNull(jdbcTemplateProvider, "jdbcTemplateProvider must not be null");
		this.directJdbcTemplate = null;
		this.properties = Objects.requireNonNull(properties, "properties must not be null");
	}

	public SqlServerLockHelper(JdbcTemplate jdbcTemplate, DatabaseProperties properties) {
		this.jdbcTemplateProvider = null;
		this.directJdbcTemplate = Objects.requireNonNull(jdbcTemplate, "jdbcTemplate must not be null");
		this.properties = Objects.requireNonNull(properties, "properties must not be null");
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

	public void acquireExclusiveTransactionLock(LockTier tier, String resourceKey) {
		acquireExclusiveTransactionLock(tier, resourceKey, properties.getDefaultLockTimeoutMs());
	}

	public void acquireExclusiveTransactionLock(LockTier tier, String resourceKey, int timeoutMs) {
		Objects.requireNonNull(tier, "tier must not be null");
		String resourceName = tier.formatResource(resourceKey);
		Integer result = requireJdbcTemplate().execute(connection -> {
			try (Statement stmt = connection.createStatement()) {
				stmt.execute("IF @@TRANCOUNT = 0 BEGIN TRAN;");
			}
			CallableStatement cs = connection.prepareCall(
					"{ ? = call sys.sp_getapplock(?, 'Exclusive', 'Transaction', ?) }");
			cs.registerOutParameter(1, Types.INTEGER);
			cs.setString(2, resourceName);
			cs.setInt(3, Math.max(0, timeoutMs));
			return cs;
		}, (CallableStatement cs) -> {
			cs.execute();
			return cs.getInt(1);
		});

		if (result == null || result < 0) {
			throw new ConflictException(
					ErrorCode.CONFLICT,
					"Could not acquire exclusive transaction lock on resource " + resourceName
							+ " (sp_getapplock status=" + result + ").");
		}
	}
}
