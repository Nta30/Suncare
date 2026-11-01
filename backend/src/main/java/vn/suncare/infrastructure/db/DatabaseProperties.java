package vn.suncare.infrastructure.db;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "suncare.db")
public class DatabaseProperties {

	private boolean preflightEnabled = true;
	private boolean enforceSetOptions = true;
	private int expectedTableCount = 58;
	private int expectedViewCount = 5;
	private int expectedRoleCount = 6;
	private int expectedPermissionCount = 20;
	private int defaultLockTimeoutMs = 5000;

	public boolean isPreflightEnabled() {
		return preflightEnabled;
	}

	public void setPreflightEnabled(boolean preflightEnabled) {
		this.preflightEnabled = preflightEnabled;
	}

	public boolean isEnforceSetOptions() {
		return enforceSetOptions;
	}

	public void setEnforceSetOptions(boolean enforceSetOptions) {
		this.enforceSetOptions = enforceSetOptions;
	}

	public int getExpectedTableCount() {
		return expectedTableCount;
	}

	public void setExpectedTableCount(int expectedTableCount) {
		this.expectedTableCount = expectedTableCount;
	}

	public int getExpectedViewCount() {
		return expectedViewCount;
	}

	public void setExpectedViewCount(int expectedViewCount) {
		this.expectedViewCount = expectedViewCount;
	}

	public int getExpectedRoleCount() {
		return expectedRoleCount;
	}

	public void setExpectedRoleCount(int expectedRoleCount) {
		this.expectedRoleCount = expectedRoleCount;
	}

	public int getExpectedPermissionCount() {
		return expectedPermissionCount;
	}

	public void setExpectedPermissionCount(int expectedPermissionCount) {
		this.expectedPermissionCount = expectedPermissionCount;
	}

	public int getDefaultLockTimeoutMs() {
		return defaultLockTimeoutMs;
	}

	public void setDefaultLockTimeoutMs(int defaultLockTimeoutMs) {
		this.defaultLockTimeoutMs = defaultLockTimeoutMs;
	}
}

