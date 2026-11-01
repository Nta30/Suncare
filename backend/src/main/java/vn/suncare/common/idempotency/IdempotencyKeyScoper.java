package vn.suncare.common.idempotency;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.regex.Pattern;
import vn.suncare.common.exception.BusinessException;
import vn.suncare.common.exception.ErrorCode;

public final class IdempotencyKeyScoper {

	private static final Pattern VALID_CLIENT_KEY = Pattern.compile("^[\\x21-\\x7E]{1,100}$");
	private static final Pattern VALID_COMMAND_TYPE = Pattern.compile("^[A-Z0-9_]{1,60}$");

	private IdempotencyKeyScoper() {
	}

	public static void validateCommandType(String commandType) {
		if (commandType == null || !VALID_COMMAND_TYPE.matcher(commandType).matches()) {
			throw new BusinessException(
					ErrorCode.BAD_REQUEST,
					"Invalid command_type format; expected 1..60 uppercase alphanumeric/underscore characters.");
		}
	}

	public static String validateClientKey(String rawIdempotencyKey) {
		if (rawIdempotencyKey == null) {
			throw new BusinessException(ErrorCode.BAD_REQUEST, "Idempotency-Key header is required.");
		}
		String trimmed = rawIdempotencyKey.trim();
		if (!VALID_CLIENT_KEY.matcher(trimmed).matches()) {
			throw new BusinessException(
					ErrorCode.BAD_REQUEST,
					"Idempotency-Key must be 1..100 printable ASCII characters without spaces.");
		}
		return trimmed;
	}

	/**
	 * Scopes client-supplied Idempotency-Key by server-authenticated account identity (DB-01, AT45).
	 * Resulting key is always <= 68 chars (fits dbo.CommandReceipt.idempotency_key varchar(100)).
	 */
	public static String scopeKey(Long accountId, String rawIdempotencyKey) {
		String validatedKey = validateClientKey(rawIdempotencyKey);
		String keyDigest = sha256Hex(validatedKey).substring(0, 48);
		if (accountId == null) {
			return "sys:" + keyDigest;
		}
		if (accountId <= 0) {
			throw new BusinessException(ErrorCode.BAD_REQUEST, "Authenticated accountId must be positive.");
		}
		return "acct:" + accountId + ":" + keyDigest;
	}

	public static String sha256Hex(String input) {
		String canonical = input == null ? "" : input;
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hash = digest.digest(canonical.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(hash);
		} catch (NoSuchAlgorithmException ex) {
			throw new IllegalStateException("SHA-256 algorithm not available", ex);
		}
	}
}

