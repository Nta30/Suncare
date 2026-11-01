package vn.suncare.common.exception;

public class ResourceNotFoundException extends BusinessException {

	public ResourceNotFoundException(String detail) {
		super(ErrorCode.RESOURCE_NOT_FOUND, detail);
	}
}

