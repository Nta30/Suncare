package vn.suncare.infrastructure.db;

import java.util.Objects;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SqlServerPreflightVerifier {

	public static final String FILTERED_INDEX_SET_SQL = """
			SET ANSI_NULLS ON;
			SET ANSI_PADDING ON;
			SET ANSI_WARNINGS ON;
			SET ARITHABORT ON;
			SET CONCAT_NULL_YIELDS_NULL ON;
			SET QUOTED_IDENTIFIER ON;
			SET NUMERIC_ROUNDABORT OFF;
			""";

	private static final String PREFLIGHT_QUERY_SQL = """
			SELECT
				(SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0) AS table_count,
				(SELECT COUNT(*) FROM sys.views WHERE is_ms_shipped = 0) AS view_count,
				(SELECT COUNT(*) FROM [dbo].[Role]) AS role_count,
				(SELECT COUNT(*) FROM [dbo].[Permission]) AS permission_count,
				CASE
					WHEN CONVERT(int, SESSIONPROPERTY('ANSI_NULLS')) = 1
					 AND CONVERT(int, SESSIONPROPERTY('ANSI_PADDING')) = 1
					 AND CONVERT(int, SESSIONPROPERTY('ANSI_WARNINGS')) = 1
					 AND CONVERT(int, SESSIONPROPERTY('ARITHABORT')) = 1
					 AND CONVERT(int, SESSIONPROPERTY('CONCAT_NULL_YIELDS_NULL')) = 1
					 AND CONVERT(int, SESSIONPROPERTY('QUOTED_IDENTIFIER')) = 1
					 AND CONVERT(int, SESSIONPROPERTY('NUMERIC_ROUNDABORT')) = 0
					THEN 1 ELSE 0
				END AS options_valid
			""";

	private final ObjectProvider<JdbcTemplate> jdbcTemplateProvider;
	private final JdbcTemplate directJdbcTemplate;
	private final DatabaseProperties properties;

	@Autowired
	public SqlServerPreflightVerifier(
			ObjectProvider<JdbcTemplate> jdbcTemplateProvider,
			DatabaseProperties properties) {
		this.jdbcTemplateProvider = Objects.requireNonNull(jdbcTemplateProvider, "jdbcTemplateProvider must not be null");
		this.directJdbcTemplate = null;
		this.properties = Objects.requireNonNull(properties, "properties must not be null");
	}

	public SqlServerPreflightVerifier(JdbcTemplate jdbcTemplate, DatabaseProperties properties) {
		this.jdbcTemplateProvider = null;
		this.directJdbcTemplate = Objects.requireNonNull(jdbcTemplate, "jdbcTemplate must not be null");
		this.properties = Objects.requireNonNull(properties, "properties must not be null");
	}

	public boolean isDatabaseConfigured() {
		return directJdbcTemplate != null
				|| (jdbcTemplateProvider != null && jdbcTemplateProvider.getIfAvailable() != null);
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

	public SqlServerPreflightReport verifyBaselineSchema() {
		JdbcTemplate jdbcTemplate = requireJdbcTemplate();
		if (properties.isEnforceSetOptions()) {
			jdbcTemplate.execute(FILTERED_INDEX_SET_SQL);
		}

		SqlServerPreflightReport report = jdbcTemplate.queryForObject(
				PREFLIGHT_QUERY_SQL,
				(rs, rowNum) -> new SqlServerPreflightReport(
						rs.getInt("table_count"),
						rs.getInt("view_count"),
						rs.getInt("role_count"),
						rs.getInt("permission_count"),
						rs.getInt("options_valid") == 1
				)
		);

		if (report == null) {
			throw new IllegalStateException("SQL Server preflight query returned no row.");
		}
		if (properties.isEnforceSetOptions() && !report.filteredIndexOptionsValid()) {
			throw new IllegalStateException(
					"SQL Server connection session options are invalid for filtered indexes (DB-06).");
		}
		if (report.tableCount() != properties.getExpectedTableCount()) {
			throw new IllegalStateException(String.format(
					"SQL Server table count mismatch: expected %d, actual %d.",
					properties.getExpectedTableCount(), report.tableCount()));
		}
		if (report.viewCount() != properties.getExpectedViewCount()) {
			throw new IllegalStateException(String.format(
					"SQL Server reporting view count mismatch: expected %d, actual %d.",
					properties.getExpectedViewCount(), report.viewCount()));
		}
		if (report.roleCount() != properties.getExpectedRoleCount()) {
			throw new IllegalStateException(String.format(
					"SQL Server RBAC Role seed count mismatch: expected %d, actual %d.",
					properties.getExpectedRoleCount(), report.roleCount()));
		}
		if (report.permissionCount() != properties.getExpectedPermissionCount()) {
			throw new IllegalStateException(String.format(
					"SQL Server RBAC Permission seed count mismatch: expected %d, actual %d.",
					properties.getExpectedPermissionCount(), report.permissionCount()));
		}
		return report;
	}
}
