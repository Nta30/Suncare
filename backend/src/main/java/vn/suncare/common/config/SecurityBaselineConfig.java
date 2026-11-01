package vn.suncare.common.config;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Clock;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import tools.jackson.databind.json.JsonMapper;
import vn.suncare.common.api.ApiErrorResponse;
import vn.suncare.common.api.CorrelationIdFilter;
import vn.suncare.common.exception.ErrorCode;

@Configuration
public class SecurityBaselineConfig {

	@Bean
	@ConditionalOnMissingBean(name = "suncareSecurityFilterChain")
	public SecurityFilterChain baselineSecurityFilterChain(
			HttpSecurity http,
			Clock clock,
			JsonMapper jsonMapper) throws Exception {
		http
				.csrf(AbstractHttpConfigurer::disable)
				.formLogin(AbstractHttpConfigurer::disable)
				.httpBasic(AbstractHttpConfigurer::disable)
				.logout(AbstractHttpConfigurer::disable)
				.cors(Customizer.withDefaults())
				.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(HttpMethod.GET, "/api/v1/health", "/actuator/health", "/actuator/health/**").permitAll()
						.anyRequest().authenticated()
				)
				.exceptionHandling(eh -> eh
						.authenticationEntryPoint((request, response, authException) -> {
							String correlationId = CorrelationIdFilter.resolve(request);
							ApiErrorResponse body = ApiErrorResponse.of(
									HttpServletResponse.SC_UNAUTHORIZED,
									ErrorCode.UNAUTHORIZED.defaultTitle(),
									"Authentication is required to access this resource.",
									ErrorCode.UNAUTHORIZED.name(),
									correlationId,
									Instant.now(clock),
									null
							);
							response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
							response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
							response.setHeader(CorrelationIdFilter.HEADER_NAME, correlationId);
							jsonMapper.writeValue(response.getOutputStream(), body);
						})
						.accessDeniedHandler((request, response, accessDeniedException) -> {
							String correlationId = CorrelationIdFilter.resolve(request);
							ApiErrorResponse body = ApiErrorResponse.of(
									HttpServletResponse.SC_FORBIDDEN,
									ErrorCode.FORBIDDEN.defaultTitle(),
									"You do not have permission to perform this action.",
									ErrorCode.FORBIDDEN.name(),
									correlationId,
									Instant.now(clock),
									null
							);
							response.setStatus(HttpServletResponse.SC_FORBIDDEN);
							response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
							response.setHeader(CorrelationIdFilter.HEADER_NAME, correlationId);
							jsonMapper.writeValue(response.getOutputStream(), body);
						})
				);
		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource(
			@Value("${suncare.cors.allowed-origins:http://localhost:5173}") String allowedOriginsRaw) {
		CorsConfiguration config = new CorsConfiguration();
		List<String> origins = Arrays.stream(allowedOriginsRaw.split(","))
				.map(String::trim)
				.filter(s -> !s.isEmpty())
				.toList();
		config.setAllowedOrigins(origins);
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Idempotency-Key", CorrelationIdFilter.HEADER_NAME));
		config.setExposedHeaders(List.of(CorrelationIdFilter.HEADER_NAME));
		config.setAllowCredentials(true);
		config.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/api/**", config);
		return source;
	}
}

