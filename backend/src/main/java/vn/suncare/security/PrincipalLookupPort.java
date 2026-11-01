package vn.suncare.security;

import java.util.Optional;

/**
 * Port used by the security filter to resolve live account state, roles, permissions,
 * and department assignments on every request.
 */
public interface PrincipalLookupPort {

	Optional<SuncarePrincipal> findPrincipalByAccountId(long accountId);
}

