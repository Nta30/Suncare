package vn.suncare.common.idempotency;

public record CommandReceiptResult(
		String resourceType,
		long resourceId,
		boolean replayed
) {
}

