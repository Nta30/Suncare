package vn.suncare.infrastructure.db;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "suncare.bootstrap")
public class BootstrapProperties {

	private boolean enabled = false;
	private String adminLogin;
	private String adminPassword;
	private String adminStaffCode = "ADM-001";
	private String adminFullName = "Quản trị hệ thống";

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	public String getAdminLogin() {
		return adminLogin;
	}

	public void setAdminLogin(String adminLogin) {
		this.adminLogin = adminLogin;
	}

	public String getAdminPassword() {
		return adminPassword;
	}

	public void setAdminPassword(String adminPassword) {
		this.adminPassword = adminPassword;
	}

	public String getAdminStaffCode() {
		return adminStaffCode;
	}

	public void setAdminStaffCode(String adminStaffCode) {
		this.adminStaffCode = adminStaffCode;
	}

	public String getAdminFullName() {
		return adminFullName;
	}

	public void setAdminFullName(String adminFullName) {
		this.adminFullName = adminFullName;
	}
}

