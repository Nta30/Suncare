package vn.suncare.infrastructure.db;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabasePreflightAndBootstrapRunner implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(DatabasePreflightAndBootstrapRunner.class);

	private final DatabaseProperties databaseProperties;
	private final BootstrapProperties bootstrapProperties;
	private final SqlServerPreflightVerifier preflightVerifier;
	private final AdminSettingsBootstrapService bootstrapService;

	public DatabasePreflightAndBootstrapRunner(
			DatabaseProperties databaseProperties,
			BootstrapProperties bootstrapProperties,
			SqlServerPreflightVerifier preflightVerifier,
			AdminSettingsBootstrapService bootstrapService) {
		this.databaseProperties = databaseProperties;
		this.bootstrapProperties = bootstrapProperties;
		this.preflightVerifier = preflightVerifier;
		this.bootstrapService = bootstrapService;
	}

	@Override
	public void run(ApplicationArguments args) {
		if (!preflightVerifier.isDatabaseConfigured()) {
			return;
		}

		if (databaseProperties.isPreflightEnabled()) {
			SqlServerPreflightReport report = preflightVerifier.verifyBaselineSchema();
			log.info("SQL Server preflight verified: tables={}, views={}, roles={}, permissions={}, filteredIndexOptions={}",
					report.tableCount(),
					report.viewCount(),
					report.roleCount(),
					report.permissionCount(),
					report.filteredIndexOptionsValid());
		}

		if (bootstrapProperties.isEnabled()) {
			AdminSettingsBootstrapService.BootstrapOutcome outcome =
					bootstrapService.bootstrapAdminAndDefaultSettings(bootstrapProperties);
			log.info("Suncare admin/settings bootstrap completed: adminAccountId={}, createdNewAdmin={}, clsValidityDays={}, onlineHoldSeconds={}",
					outcome.adminAccountId(),
					outcome.createdNewAdmin(),
					outcome.clsValidityDays(),
					outcome.onlineHoldSeconds());
		}
	}
}
