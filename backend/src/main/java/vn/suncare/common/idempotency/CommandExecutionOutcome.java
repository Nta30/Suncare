package vn.suncare.common.idempotency;

public record CommandExecutionOutcome(
		String resourceType,
		long resourceId
) {
}

