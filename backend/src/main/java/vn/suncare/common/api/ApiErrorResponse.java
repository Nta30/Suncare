package vn.suncare.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.net.URI;
import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiErrorResponse(
		URI type,
		String title,
		int status,
		String detail,
		String code,
		String correlationId,
		Instant timestamp,
		List<FieldErrorItem> fieldErrors
) {
	public record FieldErrorItem(String field, String message) {
	}

	public static ApiErrorResponse of(
			int status,
			String title,
			String detail,
			String code,
			String correlationId,
			Instant timestamp,
			List<FieldErrorItem> fieldErrors) {
		URI typeUri = URI.create("urn:suncare:error:" + code.toLowerCase());
		return new ApiErrorResponse(
				typeUri,
				title,
				status,
				detail,
				code,
				correlationId,
				timestamp,
				fieldErrors == null || fieldErrors.isEmpty() ? null : List.copyOf(fieldErrors)
		);
	}
}

