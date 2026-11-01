package vn.suncare.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.Objects;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;
import vn.suncare.common.exception.ErrorCode;
import vn.suncare.common.exception.UnauthorizedException;

/**
 * Issues and verifies HMAC-SHA256 signed compact access tokens.
 * Tokens identify only the account; live status, roles, permissions, and department scopes
 * are resolved server-side on every request.
 */
@Component
public class SuncareTokenService {

	private static final String PREFIX = "v1";
	private static final String HMAC_ALGO = "HmacSHA256";

	public record VerifiedTokenClaims(
			long accountId,
			String loginName,
			AccountType accountType,
			Instant issuedAt,
			Instant expiresAt
	) {
	}

	private final SecurityProperties properties;
	private final Clock clock;

	public SuncareTokenService(SecurityProperties properties, Clock clock) {
		this.properties = Objects.requireNonNull(properties, "properties must not be null");
		this.clock = Objects.requireNonNull(clock, "clock must not be null");
	}

	public String issueToken(SuncarePrincipal principal) {
		Instant now = Instant.now(clock);
		Instant expiresAt = now.plusSeconds(Math.max(60L, properties.getTokenTtlSeconds()));
		String payload = principal.accountId()
				+ "|" + principal.accountType().name()
				+ "|" + now.getEpochSecond()
				+ "|" + expiresAt.getEpochSecond()
				+ "|" + Base64.getUrlEncoder().withoutPadding().encodeToString(
						principal.loginName().getBytes(StandardCharsets.UTF_8));
		String encodedPayload = Base64.getUrlEncoder().withoutPadding()
				.encodeToString(payload.getBytes(StandardCharsets.UTF_8));
		String signature = sign(encodedPayload);
		return PREFIX + "." + encodedPayload + "." + signature;
	}

	public VerifiedTokenClaims verifyToken(String rawToken) {
		if (rawToken == null || rawToken.isBlank()) {
			throw new UnauthorizedException(ErrorCode.UNAUTHORIZED, "Access token is missing.");
		}
		String[] parts = rawToken.trim().split("\\.");
		if (parts.length != 3 || !PREFIX.equals(parts[0])) {
			throw new UnauthorizedException(ErrorCode.UNAUTHORIZED, "Access token format is invalid.");
		}
		String encodedPayload = parts[1];
		String providedSignature = parts[2];
		String expectedSignature = sign(encodedPayload);
		if (!MessageDigest.isEqual(
				providedSignature.getBytes(StandardCharsets.UTF_8),
				expectedSignature.getBytes(StandardCharsets.UTF_8))) {
			throw new UnauthorizedException(ErrorCode.UNAUTHORIZED, "Access token signature is invalid.");
		}

		final String decoded;
		try {
			decoded = new String(Base64.getUrlDecoder().decode(encodedPayload), StandardCharsets.UTF_8);
		} catch (IllegalArgumentException ex) {
			throw new UnauthorizedException(ErrorCode.UNAUTHORIZED, "Access token payload is malformed.");
		}

		String[] fields = decoded.split("\\|", 5);
		if (fields.length != 5) {
			throw new UnauthorizedException(ErrorCode.UNAUTHORIZED, "Access token claims are incomplete.");
		}
		try {
			long accountId = Long.parseLong(fields[0]);
			AccountType accountType = AccountType.valueOf(fields[1]);
			Instant issuedAt = Instant.ofEpochSecond(Long.parseLong(fields[2]));
			Instant expiresAt = Instant.ofEpochSecond(Long.parseLong(fields[3]));
			String loginName = new String(Base64.getUrlDecoder().decode(fields[4]), StandardCharsets.UTF_8);

			Instant now = Instant.now(clock);
			if (!now.isBefore(expiresAt)) {
				throw new UnauthorizedException(ErrorCode.UNAUTHORIZED, "Access token has expired.");
			}
			return new VerifiedTokenClaims(accountId, loginName, accountType, issuedAt, expiresAt);
		} catch (UnauthorizedException ex) {
			throw ex;
		} catch (RuntimeException ex) {
			throw new UnauthorizedException(ErrorCode.UNAUTHORIZED, "Access token claims are invalid.");
		}
	}

	private String sign(String data) {
		String secret = properties.getTokenSecret();
		if (secret == null || secret.trim().length() < 32) {
			throw new IllegalStateException("suncare.security.token-secret must be at least 32 characters.");
		}
		try {
			Mac mac = Mac.getInstance(HMAC_ALGO);
			mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGO));
			byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
			return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
		} catch (Exception ex) {
			throw new IllegalStateException("Failed to compute HMAC-SHA256 signature", ex);
		}
	}
}

