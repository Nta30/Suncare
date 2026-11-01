package vn.suncare.security;

public enum RoleCode {
	PATIENT(AccountType.PATIENT),
	DOCTOR(AccountType.STAFF),
	LAB_STAFF(AccountType.STAFF),
	DEPARTMENT_HEAD(AccountType.STAFF),
	CASHIER(AccountType.STAFF),
	SYSTEM_ADMIN(AccountType.STAFF);

	private final AccountType accountType;

	RoleCode(AccountType accountType) {
		this.accountType = accountType;
	}

	public AccountType accountType() {
		return accountType;
	}
}

