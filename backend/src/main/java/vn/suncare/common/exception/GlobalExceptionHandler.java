package vn.suncare.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.time.Clock;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import vn.suncare.common.api.ApiErrorResponse;
import vn.suncare.common.api.ApiErrorResponse.FieldErrorItem;
import vn.suncare.common.api.CorrelationIdFilter;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	private final Clock clock;

	public GlobalExceptionHandler(Clock clock) {
		this.clock = clock;
	}

	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<ApiErrorResponse> handleBusinessException(
			BusinessException ex,
			HttpServletRequest request) {
		ErrorCode code = ex.errorCode();
		return buildResponse(code, ex.getMessage(), request, null);
	}

	@ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
	public ResponseEntity<ApiErrorResponse> handleValidationExceptions(
			BindException ex,
			HttpServletRequest request) {
		List<FieldErrorItem> fieldErrors = ex.getBindingResult()
				.getFieldErrors()
				.stream()
				.sorted(Comparator.comparing(FieldError::getField))
				.map(fe -> new FieldErrorItem(
						fe.getField(),
						fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value"))
				.toList();
		return buildResponse(
				ErrorCode.VALIDATION_ERROR,
				"Request validation failed.",
				request,
				fieldErrors);
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
			ConstraintViolationException ex,
			HttpServletRequest request) {
		List<FieldErrorItem> fieldErrors = ex.getConstraintViolations()
				.stream()
				.map(cv -> new FieldErrorItem(
						cv.getPropertyPath() != null ? cv.getPropertyPath().toString() : "parameter",
						cv.getMessage()))
				.sorted(Comparator.comparing(FieldErrorItem::field))
				.toList();
		return buildResponse(
				ErrorCode.VALIDATION_ERROR,
				"Request constraint validation failed.",
				request,
				fieldErrors);
	}

	@ExceptionHandler({
			HttpMessageNotReadableException.class,
			MethodArgumentTypeMismatchException.class,
			MissingServletRequestParameterException.class
	})
	public ResponseEntity<ApiErrorResponse> handleMalformedRequest(
			Exception ex,
			HttpServletRequest request) {
		return buildResponse(
				ErrorCode.MALFORMED_REQUEST,
				"Request payload or parameter syntax is invalid.",
				request,
				null);
	}

	@ExceptionHandler({NoResourceFoundException.class, NoHandlerFoundException.class})
	public ResponseEntity<ApiErrorResponse> handleNotFound(
			Exception ex,
			HttpServletRequest request) {
		return buildResponse(
				ErrorCode.RESOURCE_NOT_FOUND,
				"The requested endpoint or resource was not found.",
				request,
				null);
	}

	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public ResponseEntity<ApiErrorResponse> handleMethodNotAllowed(
			HttpRequestMethodNotSupportedException ex,
			HttpServletRequest request) {
		return buildResponse(
				ErrorCode.METHOD_NOT_ALLOWED,
				"HTTP method is not supported for this endpoint.",
				request,
				null);
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ApiErrorResponse> handleAuthenticationException(
			AuthenticationException ex,
			HttpServletRequest request) {
		return buildResponse(
				ErrorCode.UNAUTHORIZED,
				"Authentication is required to access this resource.",
				request,
				null);
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiErrorResponse> handleAccessDeniedException(
			AccessDeniedException ex,
			HttpServletRequest request) {
		return buildResponse(
				ErrorCode.FORBIDDEN,
				"You do not have permission to perform this action.",
				request,
				null);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiErrorResponse> handleUnexpectedException(
			Exception ex,
			HttpServletRequest request) {
		String correlationId = CorrelationIdFilter.resolve(request);
		log.error("Unhandled server exception [correlationId={}, path={}]",
				correlationId,
				request != null ? request.getRequestURI() : "unknown",
				ex);
		return buildResponse(
				ErrorCode.INTERNAL_ERROR,
				"An unexpected server error occurred.",
				request,
				null);
	}

	private ResponseEntity<ApiErrorResponse> buildResponse(
			ErrorCode errorCode,
			String detail,
			HttpServletRequest request,
			List<FieldErrorItem> fieldErrors) {
		String correlationId = CorrelationIdFilter.resolve(request);
		ApiErrorResponse body = ApiErrorResponse.of(
				errorCode.httpStatus().value(),
				errorCode.defaultTitle(),
				detail,
				errorCode.name(),
				correlationId,
				Instant.now(clock),
				fieldErrors
		);
		return ResponseEntity.status(errorCode.httpStatus())
				.contentType(MediaType.APPLICATION_PROBLEM_JSON)
				.header(CorrelationIdFilter.HEADER_NAME, correlationId)
				.body(body);
	}
}

