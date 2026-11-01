package vn.suncare.common.idempotency;

import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Supplier;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.suncare.common.exception.ConflictException;
import vn.suncare.common.exception.ErrorCode;

@Service
public class CommandIdempotencyService {

	private final CommandReceiptStore receiptStore;
	private final Clock clock;

	public CommandIdempotencyService(CommandReceiptStore receiptStore, Clock clock) {
		this.receiptStore = Objects.requireNonNull(receiptStore, "receiptStore must not be null");
		this.clock = Objects.requireNonNull(clock, "clock must not be null");
	}

	@Transactional
	public CommandReceiptResult executeIdempotent(
			Long accountId,
			String commandType,
			String rawIdempotencyKey,
			String canonicalRequestPayload,
			Supplier<CommandExecutionOutcome> action) {
		IdempotencyKeyScoper.validateCommandType(commandType);
		String scopedKey = IdempotencyKeyScoper.scopeKey(accountId, rawIdempotencyKey);
		String requestHash = IdempotencyKeyScoper.sha256Hex(canonicalRequestPayload);

		Optional<CommandReceiptRecord> existing = receiptStore.findByCommandTypeAndScopedKey(commandType, scopedKey);
		if (existing.isPresent()) {
			return verifyAndReplay(existing.get(), accountId, requestHash);
		}

		CommandExecutionOutcome outcome = Objects.requireNonNull(action.get(), "CommandExecutionOutcome must not be null");
		try {
			receiptStore.insert(
					accountId,
					commandType,
					scopedKey,
					requestHash,
					outcome.resourceType(),
					outcome.resourceId(),
					Instant.now(clock)
			);
			return new CommandReceiptResult(outcome.resourceType(), outcome.resourceId(), false);
		} catch (DataIntegrityViolationException ex) {
			CommandReceiptRecord concurrent = receiptStore.findByCommandTypeAndScopedKey(commandType, scopedKey)
					.orElseThrow(() -> ex);
			return verifyAndReplay(concurrent, accountId, requestHash);
		}
	}

	private CommandReceiptResult verifyAndReplay(
			CommandReceiptRecord existing,
			Long callerAccountId,
			String requestHash) {
		if (!Objects.equals(existing.accountId(), callerAccountId)) {
			throw new ConflictException(
					ErrorCode.IDEMPOTENCY_CONFLICT,
					"Idempotency key cannot be reused across different accounts.");
		}
		if (!existing.requestHash().equalsIgnoreCase(requestHash)) {
			throw new ConflictException(
					ErrorCode.IDEMPOTENCY_CONFLICT,
					"Idempotency key was already used with a different request payload.");
		}
		return new CommandReceiptResult(existing.resourceType(), existing.resourceId(), true);
	}
}
