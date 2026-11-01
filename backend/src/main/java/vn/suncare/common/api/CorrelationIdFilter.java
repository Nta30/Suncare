package vn.suncare.common.api;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

	public static final String HEADER_NAME = "X-Correlation-Id";
	public static final String ATTRIBUTE_NAME = "suncare.correlationId";
	public static final String MDC_KEY = "correlationId";
	private static final Pattern SAFE_CORRELATION_ID = Pattern.compile("^[A-Za-z0-9._-]{1,64}$");

	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain) throws ServletException, IOException {
		String incoming = request.getHeader(HEADER_NAME);
		String correlationId = (incoming != null && SAFE_CORRELATION_ID.matcher(incoming.trim()).matches())
				? incoming.trim()
				: UUID.randomUUID().toString();

		request.setAttribute(ATTRIBUTE_NAME, correlationId);
		response.setHeader(HEADER_NAME, correlationId);
		MDC.put(MDC_KEY, correlationId);
		try {
			filterChain.doFilter(request, response);
		} finally {
			MDC.remove(MDC_KEY);
		}
	}

	public static String resolve(HttpServletRequest request) {
		if (request != null) {
			Object attr = request.getAttribute(ATTRIBUTE_NAME);
			if (attr instanceof String value && !value.isBlank()) {
				return value;
			}
		}
		String mdcValue = MDC.get(MDC_KEY);
		return (mdcValue != null && !mdcValue.isBlank()) ? mdcValue : UUID.randomUUID().toString();
	}
}

