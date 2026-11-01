package vn.suncare.common.idempotency;

import java.time.Instant;

public record CommandReceiptRecord(
		Long id,
		Long accountId,
		String commandType,
		String idempotencyKey,
		String requestHash,
		String resourceType,
		long resourceId,
		Instant createdAt
) {
}

