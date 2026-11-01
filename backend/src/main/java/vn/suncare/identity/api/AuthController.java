package vn.suncare.identity.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Duration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.suncare.common.api.CorrelationIdFilter;
import vn.suncare.identity.application.IdentityService;
import vn.suncare.security.SecurityProperties;

@RestController
@RequestMapping(path = "/api/v1/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {

	private final IdentityService identityService;
	private final SecurityProperties securityProperties;

	public AuthController(
			IdentityService identityService,
			SecurityProperties securityProperties) {
		this.identityService = identityService;
		this.securityProperties = securityProperties;
	}

	@PostMapping(path = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<PrincipalSummaryDto> registerPatient(
			@Valid @RequestBody PatientRegistrationRequest request,
			@RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
			HttpServletRequest httpRequest) {
		String correlationId = CorrelationIdFilter.resolve(httpRequest);
		PrincipalSummaryDto created = identityService.registerPatient(request, idempotencyKey, correlationId);
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}

	@PostMapping(path = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<AuthSessionResponse> login(
			@Valid @RequestBody LoginRequest request,
			HttpServletRequest httpRequest,
			HttpServletResponse httpResponse) {
		String correlationId = CorrelationIdFilter.resolve(httpRequest);
		AuthSessionResponse session = identityService.login(request, correlationId);

		ResponseCookie cookie = ResponseCookie.from(securityProperties.getCookieName(), session.accessToken())
				.httpOnly(true)
				.secure(securityProperties.isCookieSecure())
				.sameSite("Lax")
				.path("/api")
				.maxAge(Duration.ofSeconds(session.expiresInSeconds()))
				.build();
		httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

		return ResponseEntity.ok(session);
	}

	@PostMapping(path = "/logout")
	public ResponseEntity<Void> logout(HttpServletResponse httpResponse) {
		ResponseCookie clearCookie = ResponseCookie.from(securityProperties.getCookieName(), "")
				.httpOnly(true)
				.secure(securityProperties.isCookieSecure())
				.sameSite("Lax")
				.path("/api")
				.maxAge(Duration.ZERO)
				.build();
		httpResponse.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());
		return ResponseEntity.noContent().build();
	}

	@GetMapping(path = "/me")
	public ResponseEntity<PrincipalSummaryDto> me() {
		return ResponseEntity.ok(identityService.getCurrentPrincipalSummary());
	}
}

