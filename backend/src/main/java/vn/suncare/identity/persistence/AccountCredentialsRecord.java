package vn.suncare.identity.persistence;

import vn.suncare.security.AccountStatus;
import vn.suncare.security.AccountType;

public record AccountCredentialsRecord(
		long accountId,
		String loginName,
		String passwordHash,
		AccountType accountType,
		AccountStatus status,
		Long patientId,
		Long staffId
) {
}

