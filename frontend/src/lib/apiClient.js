const DEFAULT_API_BASE_URL = '/api/v1'

export class ApiError extends Error {
  constructor({ status, code, title, detail, correlationId, fieldErrors }) {
    super(detail || title || `HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.code = code || 'UNKNOWN_ERROR'
    this.title = title || 'Request Failed'
    this.detail = detail || this.message
    this.correlationId = correlationId || null
    this.fieldErrors = Array.isArray(fieldErrors) ? fieldErrors : []
  }
}

function resolveBaseUrl(explicitBaseUrl) {
  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/+$/, '')
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, '')
  }
  return DEFAULT_API_BASE_URL
}

function generateCorrelationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `corr-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function createApiClient({ baseUrl, fetchImpl } = {}) {
  const effectiveBaseUrl = resolveBaseUrl(baseUrl)
  const fetcher = fetchImpl || globalThis.fetch

  async function request(path, options = {}) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const url = `${effectiveBaseUrl}${normalizedPath}`
    const correlationId = options.correlationId || generateCorrelationId()

    const headers = new Headers(options.headers || {})
    headers.set('Accept', 'application/json, application/problem+json')
    headers.set('X-Correlation-Id', correlationId)

    if (options.idempotencyKey) {
      headers.set('Idempotency-Key', String(options.idempotencyKey))
    }

    let body = options.body
    if (body !== undefined && body !== null && typeof body === 'object' && !(body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
      body = JSON.stringify(body)
    }

    let response
    try {
      response = await fetcher(url, {
        method: options.method || 'GET',
        headers,
        body,
        credentials: 'include',
        signal: options.signal,
      })
    } catch (networkErr) {
      throw new ApiError({
        status: 0,
        code: 'NETWORK_ERROR',
        title: 'Không thể kết nối máy chủ',
        detail: networkErr instanceof Error ? networkErr.message : 'Network request failed',
        correlationId,
      })
    }

    const responseCorrelationId = response.headers.get('X-Correlation-Id') || correlationId
    const contentType = response.headers.get('Content-Type') || ''
    const isJson = contentType.includes('json')
    const payload = isJson ? await response.json().catch(() => null) : null

    if (!response.ok) {
      throw new ApiError({
        status: response.status,
        code: payload?.code || `HTTP_${response.status}`,
        title: payload?.title || response.statusText || 'Yêu cầu thất bại',
        detail: payload?.detail || 'Máy chủ từ chối yêu cầu hoặc đang bận.',
        correlationId: payload?.correlationId || responseCorrelationId,
        fieldErrors: payload?.fieldErrors || [],
      })
    }

    return payload
  }

  return {
    baseUrl: effectiveBaseUrl,
    request,
    getHealth(options) {
      return request('/health', { ...options, method: 'GET' })
    },
  }
}

export const apiClient = createApiClient()

