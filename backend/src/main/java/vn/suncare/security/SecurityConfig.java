package vn.suncare.security;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Clock;
import java.time.Instant;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import tools.jackson.databind.json.JsonMapper;
import vn.suncare.common.api.ApiErrorResponse;
import vn.suncare.common.api.CorrelationIdFilter;
import vn.suncare.common.exception.ErrorCode;

@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties(SecurityProperties.class)
public class SecurityConfig {

	@Bean
	public UserDetailsService noopUserDetailsService() {
		return username -> {
			throw new UsernameNotFoundException("Suncare uses SuncareAuthenticationFilter and IdentityService.");
		};
	}

	@Bean(name = "suncareSecurityFilterChain")
	public SecurityFilterChain suncareSecurityFilterChain(
			HttpSecurity http,
			SuncareAuthenticationFilter authenticationFilter,
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
						.requestMatchers(HttpMethod.POST, "/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/logout").permitAll()
						.anyRequest().authenticated()
				)
				.addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class)
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
}

