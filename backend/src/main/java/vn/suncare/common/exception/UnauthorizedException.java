package vn.suncare.common.exception;

public class UnauthorizedException extends BusinessException {

	public UnauthorizedException(String message) {
		super(ErrorCode.UNAUTHORIZED, message);
	}

	public UnauthorizedException(ErrorCode errorCode, String message) {
		super(errorCode, message);
	}
}

