import { RouteLink } from '@/app/router'
import { AppIcon } from '@/components/ui/AppIcon'
import { Badge } from '@/components/ui/Badge'
import { formatRoleLabel } from '@/features/auth/authEvaluation'

export function AccessDeniedView({
  title = 'Bạn không có quyền truy cập mục này',
  reason = 'Tài khoản hiện tại chưa được phân quyền để mở màn hình hoặc chức năng này.',
  requiredRoles = [],
  principal = null,
  correlationId = null,
}) {
  const fallbackHref =
    principal?.accountType === 'STAFF'
      ? '/staff'
      : principal?.accountType === 'PATIENT'
        ? '/patient'
        : '/'

  const fallbackLabel =
    principal?.accountType === 'STAFF'
      ? 'Về bàn làm việc Nhân viên'
      : principal?.accountType === 'PATIENT'
        ? 'Về cổng Bệnh nhân'
        : 'Về trang chủ'

  return (
    <section
      role="alert"
      aria-labelledby="access-denied-heading"
      className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-white p-6 shadow-2xs space-y-5"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-200">
          <AppIcon name="shield" className="text-lg" />
        </div>
        <div className="space-y-1">
          <Badge tone="warning">Giới hạn quyền truy cập</Badge>
          <h2 id="access-denied-heading" className="pt-1 text-lg font-bold text-slate-900">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">{reason}</p>
        </div>
      </div>

      {(requiredRoles.length > 0 || principal) && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-2">
          {principal && (
            <p>
              Tài khoản đang đăng nhập:{' '}
              <strong className="font-semibold text-slate-900">{principal.fullName}</strong> (
              <span>{principal.profileCode}</span>)
            </p>
          )}
          {requiredRoles.length > 0 && (
            <p>
              Vai trò được phép truy cập:{' '}
              <strong className="font-semibold text-slate-900">
                {requiredRoles.map(formatRoleLabel).join(', ')}
              </strong>
            </p>
          )}
          {correlationId && (
            <p className="text-slate-500">
              Mã tham chiếu hỗ trợ: <span className="font-mono">{correlationId}</span>
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <RouteLink
          to={fallbackHref}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <span>{fallbackLabel}</span>
          <AppIcon name="arrow-right" className="text-xs" />
        </RouteLink>
      </div>
    </section>
  )
}
