package vn.suncare.infrastructure.db;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.sql.CallableStatement;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.jdbc.core.CallableStatementCreator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import vn.suncare.common.exception.ConflictException;
import vn.suncare.common.exception.DomainValidationException;
import vn.suncare.infrastructure.db.SqlServerLockHelper.LockTier;

class DatabaseInfrastructureUnitTest {

	private static final Clock FIXED_CLOCK = Clock.fixed(Instant.parse("2026-11-01T09:00:00Z"), ZoneOffset.UTC);

	@Test
	@SuppressWarnings("unchecked")
	void preflightVerifierValidates58Tables5Views6Roles20PermissionsAndSetOptions() {
		JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
		DatabaseProperties props = new DatabaseProperties();

		when(jdbcTemplate.queryForObject(anyString(), any(RowMapper.class)))
				.thenReturn(new SqlServerPreflightReport(58, 5, 6, 20, true));

		SqlServerPreflightVerifier verifier = new SqlServerPreflightVerifier(jdbcTemplate, props);
		SqlServerPreflightReport report = verifier.verifyBaselineSchema();

		assertThat(report.tableCount()).isEqualTo(58);
		assertThat(report.viewCount()).isEqualTo(5);
		assertThat(report.roleCount()).isEqualTo(6);
		assertThat(report.permissionCount()).isEqualTo(20);
		assertThat(report.filteredIndexOptionsValid()).isTrue();
	}

	@Test
	@SuppressWarnings("unchecked")
	void preflightVerifierFailsClosedWhenTableCountOrSetOptionsMismatch() {
		JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
		DatabaseProperties props = new DatabaseProperties();

		when(jdbcTemplate.queryForObject(anyString(), any(RowMapper.class)))
				.thenReturn(new SqlServerPreflightReport(57, 5, 6, 20, true));

		SqlServerPreflightVerifier verifier = new SqlServerPreflightVerifier(jdbcTemplate, props);
		assertThatThrownBy(verifier::verifyBaselineSchema)
				.isInstanceOf(IllegalStateException.class)
				.hasMessageContaining("expected 58, actual 57");
	}

	@Test
	@SuppressWarnings("unchecked")
	void lockHelperAcquiresLockWhenSpGetAppLockReturnsZeroAndThrowsConflictOnNegativeReturn() {
		JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
		DatabaseProperties props = new DatabaseProperties();
		SqlServerLockHelper lockHelper = new SqlServerLockHelper(jdbcTemplate, props);

		when(jdbcTemplate.execute(any(CallableStatementCreator.class), any(CallableStatementCallback.class)))
				.thenReturn(0);
		lockHelper.acquireExclusiveTransactionLock(LockTier.CLINICAL_ORDER, "42");

		when(jdbcTemplate.execute(any(CallableStatementCreator.class), any(CallableStatementCallback.class)))
				.thenReturn(-1);
		assertThatThrownBy(() -> lockHelper.acquireExclusiveTransactionLock(LockTier.CLINICAL_ORDER, "42"))
				.isInstanceOf(ConflictException.class)
				.hasMessageContaining("ORDER:42");
	}

	@Test
	@SuppressWarnings("unchecked")
	void systemSettingServiceProvidesSafeDefaultsWhenJdbcUnavailableAndValidatesKeys() {
		ObjectProvider<JdbcTemplate> emptyProvider = mock(ObjectProvider.class);
		when(emptyProvider.getIfAvailable()).thenReturn(null);

		SystemSettingService service = new SystemSettingService(emptyProvider, FIXED_CLOCK);
		assertThat(service.getClsValidityDays()).isEqualTo(10);
		assertThat(service.getOnlineHoldSeconds()).isEqualTo(300);

		assertThatThrownBy(() -> service.upsertSetting("UNKNOWN_KEY", "10", 1L))
				.isInstanceOf(DomainValidationException.class);
		assertThatThrownBy(() -> service.upsertSetting(SystemSettingService.KEY_CLS_VALIDITY_DAYS, "0", 1L))
				.isInstanceOf(DomainValidationException.class);
	}

	@Test
	@SuppressWarnings("unchecked")
	void bootstrapServiceRejectsWeakOrMissingPassword() {
		JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
		ObjectProvider<JdbcTemplate> provider = mock(ObjectProvider.class);
		when(provider.getIfAvailable()).thenReturn(jdbcTemplate);

		SystemSettingService settingService = new SystemSettingService(provider, FIXED_CLOCK);
		AdminSettingsBootstrapService bootstrapService = new AdminSettingsBootstrapService(
				jdbcTemplate,
				new BCryptPasswordEncoder(),
				settingService,
				FIXED_CLOCK
		);

		BootstrapProperties props = new BootstrapProperties();
		props.setEnabled(true);
		props.setAdminLogin("admin@suncare.local");
		props.setAdminPassword("short");

		assertThatThrownBy(() -> bootstrapService.bootstrapAdminAndDefaultSettings(props))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("at least 12 characters");
	}

	@Test
	@SuppressWarnings("unchecked")
	void bootstrapServiceVerifiesExistingAdminAndSeedsMissingSettingsAndAudit() {
		JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
		ObjectProvider<JdbcTemplate> provider = mock(ObjectProvider.class);
		when(provider.getIfAvailable()).thenReturn(jdbcTemplate);

		when(jdbcTemplate.query(
				org.mockito.ArgumentMatchers.contains("FROM [dbo].[Account]"),
				any(RowMapper.class),
				any()))
				.thenReturn(java.util.List.of(77L));
		when(jdbcTemplate.query(
				org.mockito.ArgumentMatchers.contains("FROM [dbo].[Role]"),
				any(RowMapper.class)))
				.thenReturn(java.util.List.of(6L));
		when(jdbcTemplate.queryForObject(
				org.mockito.ArgumentMatchers.contains("FROM [dbo].[AccountRole]"),
				org.mockito.ArgumentMatchers.eq(Integer.class),
				any(),
				any()))
				.thenReturn(0);
		when(jdbcTemplate.queryForObject(
				org.mockito.ArgumentMatchers.contains("FROM [dbo].[SystemSetting]"),
				org.mockito.ArgumentMatchers.eq(Integer.class),
				any()))
				.thenReturn(0);
		when(jdbcTemplate.query(
				org.mockito.ArgumentMatchers.contains("SELECT [setting_value] FROM [dbo].[SystemSetting]"),
				any(RowMapper.class),
				org.mockito.ArgumentMatchers.eq(SystemSettingService.KEY_CLS_VALIDITY_DAYS)))
				.thenReturn(java.util.List.of("10"));
		when(jdbcTemplate.query(
				org.mockito.ArgumentMatchers.contains("SELECT [setting_value] FROM [dbo].[SystemSetting]"),
				any(RowMapper.class),
				org.mockito.ArgumentMatchers.eq(SystemSettingService.KEY_ONLINE_HOLD_SECONDS)))
				.thenReturn(java.util.List.of("300"));

		SystemSettingService settingService = new SystemSettingService(provider, FIXED_CLOCK);
		AdminSettingsBootstrapService bootstrapService = new AdminSettingsBootstrapService(
				jdbcTemplate,
				new BCryptPasswordEncoder(),
				settingService,
				FIXED_CLOCK
		);

		BootstrapProperties props = new BootstrapProperties();
		props.setEnabled(true);
		props.setAdminLogin("Admin@Suncare.Local");
		props.setAdminPassword("StrongBootstrapPass#2026");

		AdminSettingsBootstrapService.BootstrapOutcome outcome =
				bootstrapService.bootstrapAdminAndDefaultSettings(props);

		assertThat(outcome.adminAccountId()).isEqualTo(77L);
		assertThat(outcome.createdNewAdmin()).isFalse();
		assertThat(outcome.clsValidityDays()).isEqualTo(10);
		assertThat(outcome.onlineHoldSeconds()).isEqualTo(300);
	}

	@Test
	void mutableEntityAuditSupportRefreshesUpdatedAtInUtc() {
		SampleMutableEntity entity = new SampleMutableEntity();
		Instant t1 = Instant.parse("2026-11-01T08:00:00Z");
		Instant t2 = Instant.parse("2026-11-01T09:30:00Z");

		entity.touchUpdatedAt(t1);
		assertThat(entity.getCreatedAt()).isEqualTo(t1);
		assertThat(entity.getUpdatedAt()).isEqualTo(t1);

		entity.touchUpdatedAt(t2);
		assertThat(entity.getCreatedAt()).isEqualTo(t1);
		assertThat(entity.getUpdatedAt()).isEqualTo(t2);
	}

	static final class SampleMutableEntity extends MutableEntityAuditSupport {
	}
}
