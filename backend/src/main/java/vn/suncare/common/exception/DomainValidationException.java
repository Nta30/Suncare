package vn.suncare.common.exception;

public class DomainValidationException extends BusinessException {

	public DomainValidationException(String detail) {
		super(ErrorCode.DOMAIN_VALIDATION_ERROR, detail);
	}
}

