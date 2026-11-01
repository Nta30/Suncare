package vn.suncare.infrastructure.db;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import vn.suncare.common.idempotency.CommandExecutionOutcome;
import vn.suncare.common.idempotency.CommandIdempotencyService;
import vn.suncare.common.idempotency.CommandReceiptResult;
import vn.suncare.infrastructure.db.SqlServerLockHelper.LockTier;

/**
 * Real SQL Server-backed integration test harness (never uses H2).
 * Enabled when -Dsuncare.run.db.it=true and SQL Server TCP/IP (localhost:1433) is enabled.
 */
@SpringBootTest
@ActiveProfiles("dbtest")
@EnabledIfSystemProperty(named = "suncare.run.db.it", matches = "true")
class SqlServerDatabaseHarnessIT {

	@Autowired
	private SqlServerPreflightVerifier preflightVerifier;

	@Autowired
	private SqlServerLockHelper lockHelper;

	@Autowired
	private CommandIdempotencyService idempotencyService;

	@Autowired
	private AdminSettingsBootstrapService bootstrapService;

	@Autowired
	private SystemSettingService systemSettingService;

	@Test
	void verifiesRealSqlServerSchemaAndSeeds() {
		SqlServerPreflightReport report = preflightVerifier.verifyBaselineSchema();
		assertThat(report.tableCount()).isEqualTo(58);
		assertThat(report.viewCount()).isEqualTo(5);
		assertThat(report.roleCount()).isEqualTo(6);
		assertThat(report.permissionCount()).isEqualTo(20);
		assertThat(report.filteredIndexOptionsValid()).isTrue();
	}

	@Test
	@Transactional
	void acquiresTransactionLockAndPersistsCommandReceiptWithRollback() {
		lockHelper.acquireExclusiveTransactionLock(LockTier.SCHEDULE_SCOPE, "IT-SPEC-2026-11-01");

		CommandReceiptResult first = idempotencyService.executeIdempotent(
				null,
				"IT_SMOKE_CMD",
				"it-key-001",
				"{\"probe\":true}",
				() -> new CommandExecutionOutcome("SmokeResource", 42L)
		);
		assertThat(first.replayed()).isFalse();

		CommandReceiptResult replayed = idempotencyService.executeIdempotent(
				null,
				"IT_SMOKE_CMD",
				"it-key-001",
				"{\"probe\":true}",
				() -> new CommandExecutionOutcome("SmokeResource", 99L)
		);
		assertThat(replayed.replayed()).isTrue();
		assertThat(replayed.resourceId()).isEqualTo(42L);
	}

	@Test
	@Transactional
	void ensuresDefaultSystemSettingsWithRollback() {
		BootstrapProperties props = new BootstrapProperties();
		props.setEnabled(true);
		props.setAdminLogin("it.sysadmin@suncare.local");
		props.setAdminPassword("TestOnly#Pass2026!");
		props.setAdminStaffCode("STF-IT-ADMIN");
		props.setAdminFullName("IT System Admin");

		AdminSettingsBootstrapService.BootstrapOutcome outcome = bootstrapService.bootstrapAdminAndDefaultSettings(props);
		assertThat(outcome.createdNewAdmin()).isTrue();
		assertThat(outcome.clsValidityDays()).isEqualTo(10);
		assertThat(outcome.onlineHoldSeconds()).isEqualTo(300);
		assertThat(systemSettingService.getClsValidityDays()).isEqualTo(10);
		assertThat(systemSettingService.getOnlineHoldSeconds()).isEqualTo(300);
	}
}

