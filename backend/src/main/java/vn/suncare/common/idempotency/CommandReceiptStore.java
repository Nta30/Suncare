package vn.suncare.common.idempotency;

import java.time.Instant;
import java.util.Optional;

public interface CommandReceiptStore {

	Optional<CommandReceiptRecord> findByCommandTypeAndScopedKey(String commandType, String scopedKey);

	CommandReceiptRecord insert(
			Long accountId,
			String commandType,
			String scopedKey,
			String requestHash,
			String resourceType,
			long resourceId,
			Instant createdAt);
}

