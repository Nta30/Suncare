package vn.suncare.common.exception;

import java.util.Objects;

public class BusinessException extends RuntimeException {

	private final ErrorCode errorCode;

	public BusinessException(ErrorCode errorCode, String detail) {
		super(Objects.requireNonNull(detail, "detail must not be null"));
		this.errorCode = Objects.requireNonNull(errorCode, "errorCode must not be null");
	}

	public ErrorCode errorCode() {
		return errorCode;
	}
}

