package vn.suncare.common.exception;

public class ConflictException extends BusinessException {

	public ConflictException(String detail) {
		super(ErrorCode.CONFLICT, detail);
	}

	public ConflictException(ErrorCode errorCode, String detail) {
		super(errorCode, detail);
	}
}

