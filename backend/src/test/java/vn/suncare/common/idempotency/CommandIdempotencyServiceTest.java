package vn.suncare.common.idempotency;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DuplicateKeyException;
import vn.suncare.common.exception.ConflictException;
import vn.suncare.common.exception.ErrorCode;

class CommandIdempotencyServiceTest {

	private static final Clock FIXED_CLOCK = Clock.fixed(Instant.parse("2026-11-01T09:00:00Z"), ZoneOffset.UTC);

	private InMemoryUniqueCommandReceiptStore store;
	private CommandIdempotencyService service;

	@BeforeEach
	void setUp() {
		store = new InMemoryUniqueCommandReceiptStore();
		service = new CommandIdempotencyService(store, FIXED_CLOCK);
	}

	@Test
	void firstCallExecutesActionAndReplayWithSamePayloadReturnsStoredReceipt() {
		AtomicInteger executions = new AtomicInteger();

		CommandReceiptResult first = service.executeIdempotent(
				101L,
				"BOOK_ONSITE",
				"client-key-001",
				"{\"specialtyId\":5,\"workDate\":\"2026-11-02\",\"shift\":\"MORNING\"}",
				() -> {
					executions.incrementAndGet();
					return new CommandExecutionOutcome("Appointment", 9001L);
				}
		);

		assertThat(first.replayed()).isFalse();
		assertThat(first.resourceType()).isEqualTo("Appointment");
		assertThat(first.resourceId()).isEqualTo(9001L);
		assertThat(executions.get()).isEqualTo(1);

		CommandReceiptResult second = service.executeIdempotent(
				101L,
				"BOOK_ONSITE",
				"client-key-001",
				"{\"specialtyId\":5,\"workDate\":\"2026-11-02\",\"shift\":\"MORNING\"}",
				() -> {
					executions.incrementAndGet();
					return new CommandExecutionOutcome("Appointment", 9999L);
				}
		);

		assertThat(second.replayed()).isTrue();
		assertThat(second.resourceId()).isEqualTo(9001L);
		assertThat(executions.get()).isEqualTo(1);
	}

	@Test
	void sameKeyWithDifferentPayloadThrowsIdempotencyConflict409_AT45() {
		AtomicInteger executions = new AtomicInteger();

		service.executeIdempotent(
				101L,
				"BOOK_ONSITE",
				"client-key-at45",
				"{\"specialtyId\":5,\"shift\":\"MORNING\"}",
				() -> {
					executions.incrementAndGet();
					return new CommandExecutionOutcome("Appointment", 501L);
				}
		);

		assertThatThrownBy(() -> service.executeIdempotent(
				101L,
				"BOOK_ONSITE",
				"client-key-at45",
				"{\"specialtyId\":5,\"shift\":\"AFTERNOON\"}",
				() -> {
					executions.incrementAndGet();
					return new CommandExecutionOutcome("Appointment", 502L);
				}
		))
				.isInstanceOf(ConflictException.class)
				.satisfies(ex -> assertThat(((ConflictException) ex).errorCode())
						.isEqualTo(ErrorCode.IDEMPOTENCY_CONFLICT));

		assertThat(executions.get()).isEqualTo(1);
	}

	@Test
	void differentAccountsUsingSameRawClientKeyAreIsolatedAndDoNotLeakOrCollide_DB01_AT45() {
		CommandReceiptResult acct101 = service.executeIdempotent(
				101L,
				"BOOK_ONSITE",
				"shared-raw-key",
				"{\"specialtyId\":1}",
				() -> new CommandExecutionOutcome("Appointment", 1001L)
		);

		CommandReceiptResult acct202 = service.executeIdempotent(
				202L,
				"BOOK_ONSITE",
				"shared-raw-key",
				"{\"specialtyId\":2}",
				() -> new CommandExecutionOutcome("Appointment", 2002L)
		);

		assertThat(acct101.resourceId()).isEqualTo(1001L);
		assertThat(acct202.resourceId()).isEqualTo(2002L);
		assertThat(acct101.replayed()).isFalse();
		assertThat(acct202.replayed()).isFalse();

		String scoped101 = IdempotencyKeyScoper.scopeKey(101L, "shared-raw-key");
		String scoped202 = IdempotencyKeyScoper.scopeKey(202L, "shared-raw-key");
		assertThat(scoped101).isNotEqualTo(scoped202);
		assertThat(scoped101.length()).isLessThanOrEqualTo(100);
		assertThat(scoped202.length()).isLessThanOrEqualTo(100);
	}

	@Test
	void defenseInDepthRejectsMismatchedAccountOwnerOnStoredReceipt() {
		String scoped = IdempotencyKeyScoper.scopeKey(101L, "tampered-key");
		String hash = IdempotencyKeyScoper.sha256Hex("{\"a\":1}");
		store.putRaw(new CommandReceiptRecord(
				1L,
				999L, // different owner
				"CASH_PAYMENT",
				scoped,
				hash,
				"Payment",
				777L,
				Instant.now(FIXED_CLOCK)
		));

		assertThatThrownBy(() -> service.executeIdempotent(
				101L,
				"CASH_PAYMENT",
				"tampered-key",
				"{\"a\":1}",
				() -> new CommandExecutionOutcome("Payment", 888L)
		))
				.isInstanceOf(ConflictException.class)
				.hasMessageContaining("different accounts");
	}

	static final class InMemoryUniqueCommandReceiptStore implements CommandReceiptStore {

		private final AtomicLong idGenerator = new AtomicLong(1);
		private final Map<String, CommandReceiptRecord> byUniqueKey = new ConcurrentHashMap<>();

		void putRaw(CommandReceiptRecord record) {
			byUniqueKey.put(record.commandType() + "|" + record.idempotencyKey(), record);
		}

		@Override
		public Optional<CommandReceiptRecord> findByCommandTypeAndScopedKey(String commandType, String scopedKey) {
			return Optional.ofNullable(byUniqueKey.get(commandType + "|" + scopedKey));
		}

		@Override
		public CommandReceiptRecord insert(
				Long accountId,
				String commandType,
				String scopedKey,
				String requestHash,
				String resourceType,
				long resourceId,
				Instant createdAt) {
			String composite = commandType + "|" + scopedKey;
			CommandReceiptRecord candidate = new CommandReceiptRecord(
					idGenerator.getAndIncrement(),
					accountId,
					commandType,
					scopedKey,
					requestHash,
					resourceType,
					resourceId,
					createdAt
			);
			CommandReceiptRecord existing = byUniqueKey.putIfAbsent(composite, candidate);
			if (existing != null) {
				throw new DuplicateKeyException("UX_CommandReceipt_command_type_idempotency_key violation");
			}
			return candidate;
		}
	}
}

