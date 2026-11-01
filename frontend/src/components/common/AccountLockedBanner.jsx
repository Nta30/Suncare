import { RouteLink } from '@/app/router'
import { AppIcon } from '@/components/ui/AppIcon'
import { Button } from '@/components/ui/Button'

export function AccountLockedBanner({
  detail = 'Tài khoản của bạn hiện đang bị tạm khóa hoặc ngừng kích hoạt. Vui lòng liên hệ quầy tiếp đón hoặc bộ phận hỗ trợ Suncare để được kiểm tra.',
  correlationId = null,
  onSignOut = null,
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50/90 p-5 text-sm text-red-950 shadow-2xs space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
          <AppIcon name="lock" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-base text-red-900">
            Tài khoản tạm thời bị khóa truy cập
          </p>
          <p className="text-red-800 leading-relaxed">{detail}</p>
          {correlationId && (
            <p className="pt-1 text-xs text-red-700/80">
              Mã tham chiếu hỗ trợ: <span className="font-mono">{correlationId}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pl-12 pt-1">
        {onSignOut && (
          <Button variant="danger" size="sm" onClick={onSignOut}>
            Đăng xuất &amp; Quay lại màn hình đăng nhập
          </Button>
        )}
        <RouteLink
          to="/login"
          className="inline-flex items-center rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-100"
        >
          Về trang đăng nhập
        </RouteLink>
      </div>
    </div>
  )
}
