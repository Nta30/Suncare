package vn.suncare.identity.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.suncare.common.api.CorrelationIdFilter;
import vn.suncare.identity.application.IdentityService;

@RestController
@RequestMapping(path = "/api/v1/admin", produces = MediaType.APPLICATION_JSON_VALUE)
public class IdentityAdminController {

	private final IdentityService identityService;

	public IdentityAdminController(IdentityService identityService) {
		this.identityService = identityService;
	}

	@PostMapping(path = "/staff-accounts", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<PrincipalSummaryDto> provisionStaffAccount(
			@Valid @RequestBody StaffProvisionRequest request,
			@RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
			HttpServletRequest httpRequest) {
		String correlationId = CorrelationIdFilter.resolve(httpRequest);
		PrincipalSummaryDto created = identityService.provisionStaffAccount(request, idempotencyKey, correlationId);
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}

	@PatchMapping(path = "/accounts/{accountId}/status", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<PrincipalSummaryDto> updateAccountStatus(
			@PathVariable("accountId") long accountId,
			@Valid @RequestBody AccountStatusUpdateRequest request,
			HttpServletRequest httpRequest) {
		String correlationId = CorrelationIdFilter.resolve(httpRequest);
		return ResponseEntity.ok(identityService.updateAccountStatus(accountId, request, correlationId));
	}

	@PutMapping(path = "/accounts/{accountId}/roles", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<PrincipalSummaryDto> replaceAccountRoles(
			@PathVariable("accountId") long accountId,
			@Valid @RequestBody AccountRolesUpdateRequest request,
			HttpServletRequest httpRequest) {
		String correlationId = CorrelationIdFilter.resolve(httpRequest);
		return ResponseEntity.ok(identityService.replaceAccountRoles(accountId, request, correlationId));
	}

	@PostMapping(path = "/staff/{staffId}/department-head-assignments", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Void> assignDepartmentHead(
			@PathVariable("staffId") long staffId,
			@Valid @RequestBody DepartmentHeadAssignRequest request,
			HttpServletRequest httpRequest) {
		String correlationId = CorrelationIdFilter.resolve(httpRequest);
		identityService.assignDepartmentHead(staffId, request, correlationId);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}
}

