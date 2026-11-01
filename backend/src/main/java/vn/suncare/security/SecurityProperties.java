package vn.suncare.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "suncare.security")
public class SecurityProperties {

	private String tokenSecret = "suncare-dev-hmac-secret-key-at-least-32-bytes-long-2026";
	private long tokenTtlSeconds = 28800L;
	private String cookieName = "suncare_access_token";
	private boolean cookieSecure = false;

	public String getTokenSecret() {
		return tokenSecret;
	}

	public void setTokenSecret(String tokenSecret) {
		this.tokenSecret = tokenSecret;
	}

	public long getTokenTtlSeconds() {
		return tokenTtlSeconds;
	}

	public void setTokenTtlSeconds(long tokenTtlSeconds) {
		this.tokenTtlSeconds = tokenTtlSeconds;
	}

	public String getCookieName() {
		return cookieName;
	}

	public void setCookieName(String cookieName) {
		this.cookieName = cookieName;
	}

	public boolean isCookieSecure() {
		return cookieSecure;
	}

	public void setCookieSecure(boolean cookieSecure) {
		this.cookieSecure = cookieSecure;
	}
}

