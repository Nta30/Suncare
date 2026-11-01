import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError, createApiClient } from '../apiClient.js'
import { formatVnd, isValidVndDecimalString, toSaigonWorkDate } from '../formatters.js'
import { matchRoutePath, normalizeRoutePath } from '../routeUtils.js'
import '../../features/auth/__tests__/auth.test.js'

test('formatVnd formats large VND decimal strings without precision loss and rejects floats', () => {
  assert.equal(isValidVndDecimalString('150000'), true)
  assert.equal(isValidVndDecimalString('150000.50'), false)
  assert.equal(formatVnd('150000'), '150.000 ₫')
  assert.equal(formatVnd('9999999999999999999'), '9.999.999.999.999.999.999 ₫')
  assert.throws(() => formatVnd('150000.5'), TypeError)
  assert.throws(() => formatVnd(150000), TypeError)
})

test('toSaigonWorkDate converts UTC midnight boundaries accurately to Asia/Saigon local date', () => {
  // 16:59:59.999Z on Nov 1 is 23:59:59.999 ICT on Nov 1
  assert.equal(toSaigonWorkDate('2026-11-01T16:59:59.999Z'), '2026-11-01')
  // 17:00:00.000Z on Nov 1 is 00:00:00.000 ICT on Nov 2 (AT40 boundary)
  assert.equal(toSaigonWorkDate('2026-11-01T17:00:00.000Z'), '2026-11-02')
})

test('routeUtils normalizes paths and matches exact or wildcard routes', () => {
  const routes = [
    { path: '/', id: 'home' },
    { path: '/system-status', id: 'status' },
    { path: '*', id: 'not-found' },
  ]
  assert.equal(normalizeRoutePath('/system-status/?foo=1'), '/system-status')
  assert.equal(matchRoutePath(routes, '/')?.id, 'home')
  assert.equal(matchRoutePath(routes, '/system-status/')?.id, 'status')
  assert.equal(matchRoutePath(routes, '/unknown')?.id, 'not-found')
})

test('apiClient attaches correlation/idempotency headers and parses ProblemDetail errors', async () => {
  const capturedCalls = []
  const mockFetch = async (url, init) => {
    capturedCalls.push({ url, init })
    if (url.endsWith('/health')) {
      return new Response(
        JSON.stringify({ status: 'UP', service: 'suncare-backend' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-Id': 'corr-server-123',
          },
        }
      )
    }
    return new Response(
      JSON.stringify({
        type: 'urn:suncare:error:idempotency_conflict',
        title: 'Idempotency Conflict',
        status: 409,
        detail: 'Same Idempotency-Key reused with different payload',
        code: 'IDEMPOTENCY_CONFLICT',
        correlationId: 'corr-conflict-409',
        fieldErrors: [{ field: 'amount', message: 'Mismatch' }],
      }),
      {
        status: 409,
        headers: {
          'Content-Type': 'application/problem+json',
          'X-Correlation-Id': 'corr-conflict-409',
        },
      }
    )
  }

  const client = createApiClient({ baseUrl: '/api/v1/', fetchImpl: mockFetch })
  const health = await client.getHealth({ correlationId: 'corr-client-001' })
  assert.equal(health.status, 'UP')
  assert.equal(capturedCalls[0].url, '/api/v1/health')
  assert.equal(capturedCalls[0].init.headers.get('X-Correlation-Id'), 'corr-client-001')

  await assert.rejects(
    () =>
      client.request('/bookings/onsite', {
        method: 'POST',
        idempotencyKey: 'idem-001',
        body: { specialtyId: 1 },
      }),
    (err) => {
      assert.ok(err instanceof ApiError)
      assert.equal(err.status, 409)
      assert.equal(err.code, 'IDEMPOTENCY_CONFLICT')
      assert.equal(err.correlationId, 'corr-conflict-409')
      assert.equal(err.fieldErrors.length, 1)
      return true
    }
  )
  assert.equal(capturedCalls[1].init.headers.get('Idempotency-Key'), 'idem-001')
})

