package vn.suncare.identity.api;

public record AuthSessionResponse(
		String accessToken,
		String tokenType,
		long expiresInSeconds,
		PrincipalSummaryDto principal
) {
}

