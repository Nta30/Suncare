package vn.suncare.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.json.JsonMapper;
import vn.suncare.common.api.ApiErrorResponse;
import vn.suncare.common.api.CorrelationIdFilter;
import vn.suncare.common.exception.ErrorCode;
import vn.suncare.common.exception.UnauthorizedException;
import vn.suncare.security.SuncareTokenService.VerifiedTokenClaims;

/**
 * Resolves and re-verifies the authenticated principal against live database state
 * on every HTTP request so account locks and role revocations take effect immediately.
 */
@Component
public class SuncareAuthenticationFilter extends OncePerRequestFilter {

	private static final String BEARER_PREFIX = "Bearer ";

	private final SuncareTokenService tokenService;
	private final PrincipalLookupPort principalLookupPort;
	private final SecurityProperties securityProperties;
	private final Clock clock;
	private final JsonMapper jsonMapper;

	public SuncareAuthenticationFilter(
			SuncareTokenService tokenService,
			PrincipalLookupPort principalLookupPort,
			SecurityProperties securityProperties,
			Clock clock,
			JsonMapper jsonMapper) {
		this.tokenService = Objects.requireNonNull(tokenService, "tokenService must not be null");
		this.principalLookupPort = Objects.requireNonNull(principalLookupPort, "principalLookupPort must not be null");
		this.securityProperties = Objects.requireNonNull(securityProperties, "securityProperties must not be null");
		this.clock = Objects.requireNonNull(clock, "clock must not be null");
		this.jsonMapper = Objects.requireNonNull(jsonMapper, "jsonMapper must not be null");
	}

	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain) throws ServletException, IOException {
		String rawToken = resolveToken(request);
		if (rawToken == null) {
			filterChain.doFilter(request, response);
			return;
		}

		final VerifiedTokenClaims claims;
		try {
			claims = tokenService.verifyToken(rawToken);
		} catch (UnauthorizedException ex) {
			writeProblem(request, response, ErrorCode.UNAUTHORIZED, ex.getMessage());
			return;
		}

		Optional<SuncarePrincipal> maybePrincipal = principalLookupPort.findPrincipalByAccountId(claims.accountId());
		if (maybePrincipal.isEmpty()) {
			writeProblem(request, response, ErrorCode.UNAUTHORIZED, "Authenticated account was not found.");
			return;
		}

		SuncarePrincipal principal = maybePrincipal.get();
		if (!principal.isUsable()) {
			writeProblem(
					request,
					response,
					ErrorCode.ACCOUNT_LOCKED,
					"Account or underlying profile is locked or inactive."
			);
			return;
		}

		UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
				principal,
				null,
				principal.toGrantedAuthorities()
		);
		auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
		SecurityContextHolder.getContext().setAuthentication(auth);

		try {
			filterChain.doFilter(request, response);
		} finally {
			SecurityContextHolder.clearContext();
		}
	}

	private String resolveToken(HttpServletRequest request) {
		String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (authHeader != null && authHeader.regionMatches(true, 0, BEARER_PREFIX, 0, BEARER_PREFIX.length())) {
			String token = authHeader.substring(BEARER_PREFIX.length()).trim();
			if (!token.isEmpty()) {
				return token;
			}
		}
		Cookie[] cookies = request.getCookies();
		if (cookies != null) {
			String cookieName = securityProperties.getCookieName();
			for (Cookie cookie : cookies) {
				if (cookieName.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
					return cookie.getValue().trim();
				}
			}
		}
		return null;
	}

	private void writeProblem(
			HttpServletRequest request,
			HttpServletResponse response,
			ErrorCode errorCode,
			String detail) throws IOException {
		String correlationId = CorrelationIdFilter.resolve(request);
		ApiErrorResponse body = ApiErrorResponse.of(
				errorCode.httpStatus().value(),
				errorCode.defaultTitle(),
				detail,
				errorCode.name(),
				correlationId,
				Instant.now(clock),
				null
		);
		response.setStatus(errorCode.httpStatus().value());
		response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
		response.setHeader(CorrelationIdFilter.HEADER_NAME, correlationId);
		jsonMapper.writeValue(response.getOutputStream(), body);
	}
}

