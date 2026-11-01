package vn.suncare.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
	BAD_REQUEST(HttpStatus.BAD_REQUEST, "Bad Request"),
	VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Validation Failed"),
	MALFORMED_REQUEST(HttpStatus.BAD_REQUEST, "Malformed Request Payload"),
	UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Authentication Required"),
	INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Invalid Credentials"),
	FORBIDDEN(HttpStatus.FORBIDDEN, "Access Denied"),
	ACCOUNT_LOCKED(HttpStatus.FORBIDDEN, "Account Locked or Inactive"),
	RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Resource Not Found"),
	METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "Method Not Allowed"),
	CONFLICT(HttpStatus.CONFLICT, "State or Concurrency Conflict"),
	IDEMPOTENCY_CONFLICT(HttpStatus.CONFLICT, "Idempotency Conflict"),
	DOMAIN_VALIDATION_ERROR(HttpStatus.UNPROCESSABLE_CONTENT, "Domain Rule Violation"),
	FORBIDDEN_REGISTRATION_FIELD(HttpStatus.UNPROCESSABLE_CONTENT, "Forbidden Registration Field"),
	ACCOUNT_PROFILE_XOR_VIOLATION(HttpStatus.UNPROCESSABLE_CONTENT, "Account Profile XOR Violation"),
	ROLE_ACCOUNT_TYPE_MISMATCH(HttpStatus.UNPROCESSABLE_CONTENT, "Role Account Type Mismatch"),
	RATE_LIMITED(HttpStatus.TOO_MANY_REQUESTS, "Too Many Requests"),
	INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error");

	private final HttpStatus httpStatus;
	private final String defaultTitle;

	ErrorCode(HttpStatus httpStatus, String defaultTitle) {
		this.httpStatus = httpStatus;
		this.defaultTitle = defaultTitle;
	}

	public HttpStatus httpStatus() {
		return httpStatus;
	}

	public String defaultTitle() {
		return defaultTitle;
	}
}
