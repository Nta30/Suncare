import assert from 'node:assert/strict'
import test from 'node:test'
import { createApiClient } from '../../../lib/apiClient.js'
import { createAuthApi } from '../authApi.js'
import { PATIENT_NAV_ITEMS, STAFF_NAV_ITEMS } from '../authConstants.js'
import {
  classifyAuthApiError,
  evaluateRouteAccess,
  filterNavigationForPrincipal,
  resolveDefaultHomeForPrincipal,
  validateLoginInput,
  validatePatientRegistrationInput,
} from '../authEvaluation.js'

const SAMPLE_PATIENT_PRINCIPAL = Object.freeze({
  accountId: 101,
  loginName: 'bn.test01',
  accountType: 'PATIENT',
  status: 'ACTIVE',
  patientId: 501,
  staffId: null,
  profileCode: 'BN000501',
  fullName: 'Nguyễn Thị Hoa',
  roles: ['PATIENT'],
  permissions: [
    'APPOINTMENT_CREATE_SELF',
    'APPOINTMENT_CANCEL_SELF',
    'PROFILE_EDIT_SELF',
    'EMR_READ_SELF',
  ],
  primaryDepartmentId: null,
  activeDepartmentIds: [],
  headDepartmentIds: [],
})

const SAMPLE_DOCTOR_PRINCIPAL = Object.freeze({
  accountId: 202,
  loginName: 'bs.test02',
  accountType: 'STAFF',
  status: 'ACTIVE',
  patientId: null,
  staffId: 302,
  profileCode: 'NV000302',
  fullName: 'BS. Trần Văn Nam',
  roles: ['DOCTOR'],
  permissions: [
    'PROFILE_EDIT_SELF',
    'ENCOUNTER_WRITE_ASSIGNED',
    'EMR_READ_ASSIGNED',
    'RESULT_REVIEW_ASSIGNED',
    'ORDER_MANAGE_ASSIGNED',
    'INVOICE_ISSUE_ASSIGNED',
    'SCHEDULE_READ_SELF',
    'REPORT_EXPORT_SELF',
  ],
  primaryDepartmentId: 10,
  activeDepartmentIds: [10],
  headDepartmentIds: [],
})

const SAMPLE_ADMIN_PRINCIPAL = Object.freeze({
  accountId: 1,
  loginName: 'admin.local',
  accountType: 'STAFF',
  status: 'ACTIVE',
  patientId: null,
  staffId: 1,
  profileCode: 'NV000001',
  fullName: 'Quản trị hệ thống',
  roles: ['SYSTEM_ADMIN'],
  permissions: [
    'PROFILE_EDIT_SELF',
    'CATALOG_MANAGE',
    'PRICE_MANAGE',
    'ACCOUNT_MANAGE',
    'REPORT_VIEW_ALL',
    'REPORT_EXPORT_ALL',
  ],
  primaryDepartmentId: null,
  activeDepartmentIds: [],
  headDepartmentIds: [],
})

test('validatePatientRegistrationInput validates fields and strips forbidden privilege fields (AT01)', () => {
  const invalid = validatePatientRegistrationInput({
    loginName: 'ab',
    password: 'short',
    confirmPassword: 'mismatch',
    fullName: '',
    email: 'invalid-email',
  })
  assert.equal(invalid.isValid, false)
  assert.ok(invalid.errors.loginName)
  assert.ok(invalid.errors.password)
  assert.ok(invalid.errors.confirmPassword)
  assert.ok(invalid.errors.fullName)
  assert.ok(invalid.errors.email)

  const valid = validatePatientRegistrationInput({
    loginName: '  bn.hoangminh  ',
    password: 'Password#123',
    confirmPassword: 'Password#123',
    fullName: '  Hoàng Minh  ',
    birthDate: '1995-08-15',
    sex: 'MALE',
    phone: '0901234567',
    role: 'SYSTEM_ADMIN',
    accountType: 'STAFF',
    staffId: 99,
  })
  assert.equal(valid.isValid, true)
  assert.equal(valid.payload.loginName, 'bn.hoangminh')
  assert.equal(valid.payload.fullName, 'Hoàng Minh')
  assert.equal('role' in valid.payload, false)
  assert.equal('accountType' in valid.payload, false)
  assert.equal('staffId' in valid.payload, false)
})

test('evaluateRouteAccess and filterNavigationForPrincipal enforce XOR, accountType, role, and permission guards (AT02/AT03)', () => {
  assert.equal(evaluateRouteAccess(null, { requireAuth: true }).reason, 'UNAUTHENTICATED')

  assert.equal(
    evaluateRouteAccess(
      { ...SAMPLE_PATIENT_PRINCIPAL, status: 'LOCKED' },
      { requireAuth: true }
    ).reason,
    'ACCOUNT_LOCKED'
  )

  // Violated XOR (both patientId and staffId non-null)
  assert.equal(
    evaluateRouteAccess(
      { ...SAMPLE_PATIENT_PRINCIPAL, staffId: 777 },
      { requireAuth: true }
    ).reason,
    'INVALID_PRINCIPAL_XOR'
  )

  // Patient allowed on /patient, denied on /staff
  assert.equal(
    evaluateRouteAccess(SAMPLE_PATIENT_PRINCIPAL, {
      requireAuth: true,
      requiredAccountType: 'PATIENT',
      requiredPermissions: ['APPOINTMENT_CREATE_SELF'],
    }).allowed,
    true
  )
  assert.equal(
    evaluateRouteAccess(SAMPLE_PATIENT_PRINCIPAL, {
      requireAuth: true,
      requiredAccountType: 'STAFF',
    }).reason,
    'WRONG_ACCOUNT_TYPE'
  )

  // Doctor allowed on encounters, denied on admin
  assert.equal(
    evaluateRouteAccess(SAMPLE_DOCTOR_PRINCIPAL, {
      requireAuth: true,
      requiredAccountType: 'STAFF',
      requiredRoles: ['DOCTOR'],
      requiredPermissions: ['ENCOUNTER_WRITE_ASSIGNED'],
    }).allowed,
    true
  )
  assert.equal(
    evaluateRouteAccess(SAMPLE_DOCTOR_PRINCIPAL, {
      requireAuth: true,
      requiredAccountType: 'STAFF',
      requiredRoles: ['SYSTEM_ADMIN'],
      requiredPermissions: ['ACCOUNT_MANAGE'],
    }).reason,
    'MISSING_ROLE'
  )

  const doctorNav = filterNavigationForPrincipal(STAFF_NAV_ITEMS, SAMPLE_DOCTOR_PRINCIPAL).map(
    (item) => item.path
  )
  assert.ok(doctorNav.includes('/staff/encounters'))
  assert.ok(!doctorNav.includes('/staff/admin'))
  assert.ok(!doctorNav.includes('/staff/lab'))

  const adminNav = filterNavigationForPrincipal(STAFF_NAV_ITEMS, SAMPLE_ADMIN_PRINCIPAL).map(
    (item) => item.path
  )
  assert.ok(adminNav.includes('/staff/admin'))
  assert.ok(adminNav.includes('/staff/reports'))
  assert.ok(!adminNav.includes('/staff/encounters'))

  const patientNav = filterNavigationForPrincipal(
    PATIENT_NAV_ITEMS,
    SAMPLE_PATIENT_PRINCIPAL
  ).map((item) => item.path)
  assert.equal(patientNav.length, 5)
  assert.equal(resolveDefaultHomeForPrincipal(SAMPLE_PATIENT_PRINCIPAL), '/patient')
  assert.equal(resolveDefaultHomeForPrincipal(SAMPLE_DOCTOR_PRINCIPAL), '/staff')
})

test('authApi handles login, Idempotency-Key registration, admin endpoints, and immediate session clearing on 403 ACCOUNT_LOCKED', async () => {
  let nextStatus = 200
  const captured = []

  const mockFetch = async (url, init) => {
    captured.push({ url, init })
    if (url.endsWith('/auth/register')) {
      return new Response(JSON.stringify(SAMPLE_PATIENT_PRINCIPAL), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (url.endsWith('/auth/login')) {
      return new Response(
        JSON.stringify({
          accessToken: 'token-abc-123',
          tokenType: 'Bearer',
          expiresInSeconds: 28800,
          principal: SAMPLE_DOCTOR_PRINCIPAL,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    if (url.endsWith('/admin/staff-accounts')) {
      return new Response(JSON.stringify(SAMPLE_DOCTOR_PRINCIPAL), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (url.endsWith('/auth/me') && nextStatus === 403) {
      return new Response(
        JSON.stringify({
          title: 'Account Locked',
          status: 403,
          detail: 'Account or underlying profile is locked or inactive.',
          code: 'ACCOUNT_LOCKED',
          correlationId: 'corr-lock-999',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/problem+json',
            'X-Correlation-Id': 'corr-lock-999',
          },
        }
      )
    }
    return new Response(JSON.stringify(SAMPLE_DOCTOR_PRINCIPAL), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const client = createApiClient({ baseUrl: '/api/v1', fetchImpl: mockFetch })
  const auth = createAuthApi({ client })

  const events = []
  auth.onAuthStateFailure((classification, err) => {
    events.push({ classification, err })
  })

  const loginCheck = validateLoginInput({ loginName: 'bs.test02', password: 'Password#123' })
  assert.equal(loginCheck.isValid, true)

  await auth.registerPatient(
    { loginName: 'bn.test01', password: 'Password#123', fullName: 'Nguyễn Thị Hoa' },
    { idempotencyKey: 'reg-key-001' }
  )
  assert.equal(captured[0].init.headers.get('Idempotency-Key'), 'reg-key-001')

  const session = await auth.login(loginCheck.sanitized)
  assert.equal(session.accessToken, 'token-abc-123')
  assert.equal(auth.getAccessToken(), 'token-abc-123')

  const me = await auth.fetchCurrentPrincipal()
  assert.equal(me.loginName, 'bs.test02')
  assert.equal(captured[2].init.headers.get('Authorization'), 'Bearer token-abc-123')

  const provisioned = await auth.provisionStaffAccount(
    {
      loginName: 'bs.test02',
      password: 'Password#123',
      fullName: 'BS. Trần Văn Nam',
      roles: ['DOCTOR'],
    },
    { idempotencyKey: 'prov-key-001' }
  )
  assert.equal(provisioned.profileCode, 'NV000302')
  assert.equal(captured[3].url, '/api/v1/admin/staff-accounts')
  assert.equal(captured[3].init.headers.get('Idempotency-Key'), 'prov-key-001')

  // Simulate account locked on next request
  nextStatus = 403
  await assert.rejects(() => auth.fetchCurrentPrincipal(), (err) => {
    const classified = classifyAuthApiError(err)
    assert.equal(classified.category, 'ACCOUNT_LOCKED')
    assert.equal(classified.isLocked, true)
    return true
  })

  assert.equal(auth.getAccessToken(), null)
  assert.equal(events.length, 1)
  assert.equal(events[0].classification.isLocked, true)
  assert.equal(events[0].err.correlationId, 'corr-lock-999')
})
