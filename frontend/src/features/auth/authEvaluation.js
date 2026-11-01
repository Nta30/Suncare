import { ACCOUNT_STATUSES, ACCOUNT_TYPES, ROLE_METADATA } from './authConstants.js'

export function resolveDefaultHomeForPrincipal(principal) {
  if (!principal) {
    return '/login'
  }
  if (principal.accountType === ACCOUNT_TYPES.PATIENT) {
    return '/patient'
  }
  if (principal.accountType === ACCOUNT_TYPES.STAFF) {
    return '/staff'
  }
  return '/'
}

export function formatRoleLabel(roleCode) {
  return ROLE_METADATA[roleCode]?.label || roleCode
}

export function evaluateRouteAccess(principal, accessRule = {}) {
  const {
    requireAuth = true,
    requiredAccountType = null,
    requiredRoles = [],
    requiredPermissions = [],
  } = accessRule

  if (!requireAuth) {
    return { allowed: true, reason: null }
  }

  if (!principal || !principal.accountId) {
    return {
      allowed: false,
      reason: 'UNAUTHENTICATED',
      redirectTo: '/login',
    }
  }

  if (principal.status && principal.status !== ACCOUNT_STATUSES.ACTIVE) {
    return {
      allowed: false,
      reason: 'ACCOUNT_LOCKED',
      redirectTo: '/login',
    }
  }

  // Enforce XOR invariant (AT02) on client representation as well
  const hasPatient = principal.patientId !== null && principal.patientId !== undefined
  const hasStaff = principal.staffId !== null && principal.staffId !== undefined
  if (hasPatient === hasStaff) {
    return {
      allowed: false,
      reason: 'INVALID_PRINCIPAL_XOR',
      redirectTo: '/login',
    }
  }

  if (requiredAccountType && principal.accountType !== requiredAccountType) {
    return {
      allowed: false,
      reason: 'WRONG_ACCOUNT_TYPE',
      requiredAccountType,
      requiredRoles,
      requiredPermissions,
    }
  }

  const principalRoles = Array.isArray(principal.roles) ? principal.roles : []
  if (requiredRoles.length > 0) {
    const hasMatchingRole = requiredRoles.some((role) => principalRoles.includes(role))
    if (!hasMatchingRole) {
      return {
        allowed: false,
        reason: 'MISSING_ROLE',
        requiredAccountType,
        requiredRoles,
        requiredPermissions,
      }
    }
  }

  const principalPermissions = Array.isArray(principal.permissions) ? principal.permissions : []
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every((perm) =>
      principalPermissions.includes(perm)
    )
    if (!hasAllPermissions) {
      return {
        allowed: false,
        reason: 'MISSING_PERMISSION',
        requiredAccountType,
        requiredRoles,
        requiredPermissions,
      }
    }
  }

  return { allowed: true, reason: null }
}

export function filterNavigationForPrincipal(navItems, principal) {
  if (!Array.isArray(navItems) || !principal) {
    return []
  }
  return navItems.filter((item) => {
    const result = evaluateRouteAccess(principal, {
      requireAuth: true,
      requiredAccountType: item.requiredAccountType || null,
      requiredRoles: item.requiredRoles || [],
      requiredPermissions: item.requiredPermissions || [],
    })
    return result.allowed
  })
}

export function validateLoginInput({ loginName, password } = {}) {
  const errors = {}
  const trimmedLogin = typeof loginName === 'string' ? loginName.trim() : ''
  const rawPassword = typeof password === 'string' ? password : ''

  if (!trimmedLogin) {
    errors.loginName = 'Vui lòng nhập tên đăng nhập.'
  } else if (trimmedLogin.length > 100) {
    errors.loginName = 'Tên đăng nhập không vượt quá 100 ký tự.'
  }

  if (!rawPassword) {
    errors.password = 'Vui lòng nhập mật khẩu.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      loginName: trimmedLogin,
      password: rawPassword,
    },
  }
}

export function validatePatientRegistrationInput(input = {}) {
  const errors = {}
  const loginName = typeof input.loginName === 'string' ? input.loginName.trim() : ''
  const password = typeof input.password === 'string' ? input.password : ''
  const confirmPassword =
    typeof input.confirmPassword === 'string' ? input.confirmPassword : password
  const fullName = typeof input.fullName === 'string' ? input.fullName.trim() : ''
  const birthDate = typeof input.birthDate === 'string' ? input.birthDate.trim() : ''
  const sex = typeof input.sex === 'string' ? input.sex.trim() : ''
  const phone = typeof input.phone === 'string' ? input.phone.trim() : ''
  const email = typeof input.email === 'string' ? input.email.trim() : ''
  const address = typeof input.address === 'string' ? input.address.trim() : ''
  const identityNumber =
    typeof input.identityNumber === 'string' ? input.identityNumber.trim() : ''
  const emergencyName =
    typeof input.emergencyName === 'string' ? input.emergencyName.trim() : ''
  const emergencyPhone =
    typeof input.emergencyPhone === 'string' ? input.emergencyPhone.trim() : ''

  if (!loginName) {
    errors.loginName = 'Tên đăng nhập là bắt buộc.'
  } else if (loginName.length < 3 || loginName.length > 100) {
    errors.loginName = 'Tên đăng nhập phải từ 3 đến 100 ký tự.'
  }

  if (!password) {
    errors.password = 'Mật khẩu là bắt buộc.'
  } else if (password.length < 8 || password.length > 128) {
    errors.password = 'Mật khẩu phải từ 8 đến 128 ký tự.'
  }

  if (input.confirmPassword !== undefined && password !== confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
  }

  if (!fullName) {
    errors.fullName = 'Họ và tên bệnh nhân là bắt buộc.'
  } else if (fullName.length > 150) {
    errors.fullName = 'Họ và tên không vượt quá 150 ký tự.'
  }

  if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    errors.birthDate = 'Ngày sinh phải có định dạng YYYY-MM-DD.'
  }

  if (sex && !['MALE', 'FEMALE', 'OTHER'].includes(sex)) {
    errors.sex = 'Giới tính không hợp lệ.'
  }

  if (phone && phone.length > 20) {
    errors.phone = 'Số điện thoại không vượt quá 20 ký tự.'
  }

  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    errors.email = 'Địa chỉ email không hợp lệ.'
  }

  // Strictly omit role/accountType/staffId/departmentId (AT01)
  const payload = {
    loginName,
    password,
    fullName,
    birthDate: birthDate || null,
    sex: sex || null,
    phone: phone || null,
    email: email || null,
    address: address || null,
    identityNumber: identityNumber || null,
    emergencyName: emergencyName || null,
    emergencyPhone: emergencyPhone || null,
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    payload,
  }
}

export function classifyAuthApiError(error) {
  if (!error) {
    return { category: 'UNKNOWN', shouldClearSession: false, isLocked: false }
  }
  const status = Number(error.status || 0)
  const code = String(error.code || '')

  if (code === 'ACCOUNT_LOCKED') {
    return {
      category: 'ACCOUNT_LOCKED',
      shouldClearSession: true,
      isLocked: true,
      userMessage:
        error.detail ||
        'Tài khoản hoặc hồ sơ liên kết đã bị khóa. Quyền truy cập bị thu hồi ngay lập tức.',
    }
  }

  if (status === 401 || code === 'UNAUTHORIZED' || code === 'INVALID_CREDENTIALS') {
    return {
      category: code === 'INVALID_CREDENTIALS' ? 'INVALID_CREDENTIALS' : 'SESSION_EXPIRED',
      shouldClearSession: code !== 'INVALID_CREDENTIALS',
      isLocked: false,
      userMessage:
        code === 'INVALID_CREDENTIALS'
          ? 'Tên đăng nhập hoặc mật khẩu không chính xác.'
          : 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
    }
  }

  if (status === 403 || code === 'FORBIDDEN') {
    return {
      category: 'FORBIDDEN_SCOPE',
      shouldClearSession: false,
      isLocked: false,
      userMessage:
        error.detail ||
        'Bạn không có quyền hoặc không thuộc phạm vi dữ liệu (khoa/bác sĩ/hồ sơ) để thực hiện thao tác này.',
    }
  }

  if (status === 409) {
    return {
      category: 'CONFLICT',
      shouldClearSession: false,
      isLocked: false,
      userMessage: error.detail || 'Dữ liệu bị trùng lặp hoặc xung đột khóa Idempotency-Key.',
    }
  }

  return {
    category: 'GENERAL_ERROR',
    shouldClearSession: false,
    isLocked: false,
    userMessage: error.detail || error.message || 'Đã xảy ra lỗi khi giao tiếp với máy chủ.',
  }
}

