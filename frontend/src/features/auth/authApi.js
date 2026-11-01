import { apiClient as defaultApiClient } from '../../lib/apiClient.js'
import { classifyAuthApiError } from './authEvaluation.js'

export function createAuthApi({ client = defaultApiClient } = {}) {
  let inMemoryAccessToken = null
  let inFlightMePromise = null
  const authEventListeners = new Set()

  function setAccessToken(token) {
    inMemoryAccessToken = typeof token === 'string' && token.trim() ? token.trim() : null
  }

  function getAccessToken() {
    return inMemoryAccessToken
  }

  function onAuthStateFailure(listener) {
    authEventListeners.add(listener)
    return () => authEventListeners.delete(listener)
  }

  function notifyAuthFailure(classification, error) {
    for (const listener of authEventListeners) {
      try {
        listener(classification, error)
      } catch {
        // Ignore listener error
      }
    }
  }

  async function authenticatedRequest(path, options = {}) {
    const headers = new Headers(options.headers || {})
    if (inMemoryAccessToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${inMemoryAccessToken}`)
    }

    try {
      return await client.request(path, {
        ...options,
        headers,
      })
    } catch (err) {
      const classification = classifyAuthApiError(err)
      if (classification.shouldClearSession || classification.isLocked) {
        inMemoryAccessToken = null
        notifyAuthFailure(classification, err)
      }
      throw err
    }
  }

  return {
    setAccessToken,
    getAccessToken,
    onAuthStateFailure,
    authenticatedRequest,

    async login({ loginName, password }, options = {}) {
      const session = await client.request('/auth/login', {
        ...options,
        method: 'POST',
        body: { loginName, password },
      })
      if (session && session.accessToken) {
        setAccessToken(session.accessToken)
      }
      return session
    },

    async registerPatient(payload, { idempotencyKey, ...options } = {}) {
      const effectiveKey =
        idempotencyKey ||
        (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? `reg-${crypto.randomUUID()}`
          : `reg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`)

      return client.request('/auth/register', {
        ...options,
        method: 'POST',
        idempotencyKey: effectiveKey,
        body: payload,
      })
    },

    async logout(options = {}) {
      try {
        await authenticatedRequest('/auth/logout', {
          ...options,
          method: 'POST',
        })
      } finally {
        setAccessToken(null)
      }
    },

    async fetchCurrentPrincipal(options = {}) {
      if (inFlightMePromise) {
        return inFlightMePromise
      }
      inFlightMePromise = authenticatedRequest('/auth/me', {
        ...options,
        method: 'GET',
      }).finally(() => {
        inFlightMePromise = null
      })
      return inFlightMePromise
    },

    async updateOwnProfile(payload, options = {}) {
      return authenticatedRequest('/identity/profile', {
        ...options,
        method: 'PATCH',
        body: payload,
      })
    },

    async checkPatientSelfScope(patientId, options = {}) {
      return authenticatedRequest(
        `/identity/scope-check/patients/${encodeURIComponent(patientId)}/emr`,
        {
          ...options,
          method: 'GET',
        }
      )
    },

    async checkAssignedDoctorScope(doctorStaffId, options = {}) {
      return authenticatedRequest(
        `/identity/scope-check/doctors/${encodeURIComponent(doctorStaffId)}/encounters`,
        {
          ...options,
          method: 'GET',
        }
      )
    },

    async checkDepartmentHeadScope(departmentId, options = {}) {
      return authenticatedRequest(
        `/identity/scope-check/departments/${encodeURIComponent(departmentId)}/schedule-publish`,
        {
          ...options,
          method: 'GET',
        }
      )
    },

    async provisionStaffAccount(payload, { idempotencyKey, ...options } = {}) {
      const effectiveKey =
        idempotencyKey ||
        (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? `prov-${crypto.randomUUID()}`
          : `prov-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`)

      return authenticatedRequest('/admin/staff-accounts', {
        ...options,
        method: 'POST',
        idempotencyKey: effectiveKey,
        body: payload,
      })
    },

    async updateAccountStatus(accountId, { status, reason }, options = {}) {
      return authenticatedRequest(`/admin/accounts/${encodeURIComponent(accountId)}/status`, {
        ...options,
        method: 'PATCH',
        body: { status, reason },
      })
    },

    async replaceAccountRoles(accountId, { roles, reason }, options = {}) {
      return authenticatedRequest(`/admin/accounts/${encodeURIComponent(accountId)}/roles`, {
        ...options,
        method: 'PUT',
        body: { roles, reason: reason || null },
      })
    },

    async assignDepartmentHead(staffId, { departmentId, validFrom, validTo }, options = {}) {
      return authenticatedRequest(
        `/admin/staff/${encodeURIComponent(staffId)}/department-head-assignments`,
        {
          ...options,
          method: 'POST',
          body: {
            departmentId: Number(departmentId),
            validFrom: validFrom || null,
            validTo: validTo || null,
          },
        }
      )
    },
  }
}

export const authApi = createAuthApi()
