package vn.suncare.common.idempotency;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcCommandReceiptStore implements CommandReceiptStore {

	private static final String SELECT_SQL = """
			SELECT [id], [account_id], [command_type], [idempotency_key], [request_hash], [resource_type], [resource_id], [created_at]
			FROM [dbo].[CommandReceipt]
			WHERE [command_type] = ? AND [idempotency_key] = ?
			""";

	private static final String INSERT_SQL = """
			INSERT INTO [dbo].[CommandReceipt]
			([account_id], [command_type], [idempotency_key], [request_hash], [resource_type], [resource_id], [created_at])
			VALUES (?, ?, ?, ?, ?, ?, ?)
			""";

	private static final RowMapper<CommandReceiptRecord> ROW_MAPPER = (rs, rowNum) -> {
		long accountIdVal = rs.getLong("account_id");
		Long accountId = rs.wasNull() ? null : accountIdVal;
		Timestamp createdTs = rs.getTimestamp("created_at");
		return new CommandReceiptRecord(
				rs.getLong("id"),
				accountId,
				rs.getString("command_type"),
				rs.getString("idempotency_key"),
				rs.getString("request_hash") != null ? rs.getString("request_hash").trim() : "",
				rs.getString("resource_type"),
				rs.getLong("resource_id"),
				createdTs != null ? createdTs.toInstant() : Instant.EPOCH
		);
	};

	private final ObjectProvider<JdbcTemplate> jdbcTemplateProvider;
	private final JdbcTemplate directJdbcTemplate;

	@Autowired
	public JdbcCommandReceiptStore(ObjectProvider<JdbcTemplate> jdbcTemplateProvider) {
		this.jdbcTemplateProvider = Objects.requireNonNull(jdbcTemplateProvider, "jdbcTemplateProvider must not be null");
		this.directJdbcTemplate = null;
	}

	public JdbcCommandReceiptStore(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplateProvider = null;
		this.directJdbcTemplate = Objects.requireNonNull(jdbcTemplate, "jdbcTemplate must not be null");
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

	@Override
	public Optional<CommandReceiptRecord> findByCommandTypeAndScopedKey(String commandType, String scopedKey) {
		List<CommandReceiptRecord> rows = requireJdbcTemplate().query(SELECT_SQL, ROW_MAPPER, commandType, scopedKey);
		return rows.stream().findFirst();
	}

	@Override
	public CommandReceiptRecord insert(
			Long accountId,
			String commandType,
			String scopedKey,
			String requestHash,
			String resourceType,
			long resourceId,
			Instant createdAt) {
		KeyHolder keyHolder = new GeneratedKeyHolder();
		requireJdbcTemplate().update(connection -> {
			PreparedStatement ps = connection.prepareStatement(INSERT_SQL, Statement.RETURN_GENERATED_KEYS);
			if (accountId == null) {
				ps.setNull(1, Types.BIGINT);
			} else {
				ps.setLong(1, accountId);
			}
			ps.setString(2, commandType);
			ps.setString(3, scopedKey);
			ps.setString(4, requestHash);
			ps.setString(5, resourceType);
			ps.setLong(6, resourceId);
			ps.setTimestamp(7, Timestamp.from(createdAt));
			return ps;
		}, keyHolder);

		Number key = keyHolder.getKey();
		long id = key != null ? key.longValue() : 0L;
		return new CommandReceiptRecord(
				id,
				accountId,
				commandType,
				scopedKey,
				requestHash,
				resourceType,
				resourceId,
				createdAt
		);
	}
}
