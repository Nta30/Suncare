package vn.suncare.infrastructure.db;

public record SqlServerPreflightReport(
		int tableCount,
		int viewCount,
		int roleCount,
		int permissionCount,
		boolean filteredIndexOptionsValid
) {
}

