package vn.suncare.common.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import vn.suncare.common.api.CorrelationIdFilter;

@Configuration
public class SecurityBaselineConfig {

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

