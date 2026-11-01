const VND_DECIMAL_STRING_PATTERN = /^-?\d+$/

export function isValidVndDecimalString(value) {
  return typeof value === 'string' && VND_DECIMAL_STRING_PATTERN.test(value.trim())
}

export function formatVnd(decimalString) {
  if (!isValidVndDecimalString(decimalString)) {
    throw new TypeError('VND amount must be an integer decimal string (e.g. "150000")')
  }
  const normalized = BigInt(decimalString.trim()).toString()
  const isNegative = normalized.startsWith('-')
  const digits = isNegative ? normalized.slice(1) : normalized
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${isNegative ? '-' : ''}${grouped} ₫`
}

const SAIGON_DATE_PARTS_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Saigon',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const SAIGON_DATETIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Saigon',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export function toSaigonWorkDate(isoUtcInstant) {
  const date = new Date(isoUtcInstant)
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Invalid ISO UTC instant')
  }
  return SAIGON_DATE_PARTS_FORMATTER.format(date)
}

export function formatSaigonDateTime(isoUtcInstant) {
  const date = new Date(isoUtcInstant)
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Invalid ISO UTC instant')
  }
  return `${SAIGON_DATETIME_FORMATTER.format(date)} (GMT+7)`
}

