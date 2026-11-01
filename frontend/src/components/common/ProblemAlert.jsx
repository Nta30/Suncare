import { AppIcon } from '@/components/ui/AppIcon'

const USER_FRIENDLY_TITLES = Object.freeze({
  INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu chưa chính xác',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  ACCOUNT_LOCKED: 'Tài khoản đã bị tạm khóa',
  VALIDATION_ERROR: 'Thông tin gửi lên chưa hợp lệ',
  CONFLICT: 'Thông tin đã tồn tại hoặc đang được xử lý',
  IDEMPOTENCY_CONFLICT: 'Yêu cầu đang trùng lặp, vui lòng thử lại',
  NETWORK_ERROR: 'Không thể kết nối tới hệ thống',
})

export function ProblemAlert({ error, titleOverride = null, onDismiss = null }) {
  if (!error) {
    return null
  }

  const code = error.code || ''
  const title =
    titleOverride ||
    USER_FRIENDLY_TITLES[code] ||
    error.title ||
    'Không thể hoàn tất yêu cầu'
  const detail =
    code === 'INVALID_CREDENTIALS'
      ? 'Vui lòng kiểm tra lại tên đăng nhập và mật khẩu của bạn.'
      : error.detail || error.message || 'Đã xảy ra sự cố trong quá trình xử lý. Vui lòng thử lại.'
  const fieldErrors = Array.isArray(error.fieldErrors) ? error.fieldErrors : []

  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-950 shadow-2xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-red-600">
            <AppIcon name="circle-exclamation" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-red-900">{title}</p>
            <p className="text-red-800 leading-relaxed">{detail}</p>

            {fieldErrors.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-xs text-red-800 space-y-1">
                {fieldErrors.map((fe, idx) => (
                  <li key={`${fe.field || 'field'}-${idx}`}>
                    {fe.message}
                  </li>
                ))}
              </ul>
            )}

            {error.correlationId && (
              <p className="pt-1 text-xs text-red-700/80">
                Mã tham chiếu hỗ trợ: <span className="font-mono">{error.correlationId}</span>
              </p>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Đóng thông báo lỗi"
            className="rounded-lg p-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            <AppIcon name="close" />
          </button>
        )}
      </div>
    </div>
  )
}
