import { RouteLink } from '@/app/router'
import { useRouter } from '@/app/routerContext'
import { AccessDeniedView } from '@/components/common/AccessDeniedView'
import { AccountLockedBanner } from '@/components/common/AccountLockedBanner'
import { AsyncStateView } from '@/components/common/AsyncStateView'
import { AppIcon } from '@/components/ui/AppIcon'
import { Badge } from '@/components/ui/Badge'
import {
  evaluateRouteAccess,
  formatRoleLabel,
  resolveDefaultHomeForPrincipal,
} from '@/features/auth/authEvaluation'
import { useAuth } from '@/features/auth/useAuth'

export function ProtectedRoute({
  requiredAccountType = null,
  requiredRoles = [],
  requiredPermissions = [],
  children,
}) {
  const { status, principal, lockedError, logout } = useAuth()
  const { path } = useRouter()

  if (status === 'initializing') {
    return (
      <AsyncStateView
        status="loading"
        loadingText="Đang kiểm tra phiên đăng nhập của bạn..."
      />
    )
  }

  if (status === 'locked' || principal?.status === 'LOCKED') {
    return (
      <AccountLockedBanner
        detail={
          lockedError?.detail ||
          'Tài khoản của bạn đã bị tạm khóa hoặc ngừng kích hoạt. Vui lòng liên hệ bộ phận hỗ trợ Suncare.'
        }
        correlationId={lockedError?.correlationId || null}
        onSignOut={() => logout('Đã đăng xuất khỏi tài khoản bị khóa.')}
      />
    )
  }

  const evaluation = evaluateRouteAccess(principal, {
    requireAuth: true,
    requiredAccountType,
    requiredRoles,
    requiredPermissions,
  })

  if (!evaluation.allowed) {
    if (evaluation.reason === 'UNAUTHENTICATED') {
      return (
        <section
          role="region"
          aria-labelledby="unauth-guard-heading"
          className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-2xs space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
              <AppIcon name="lock" className="text-base" />
            </div>
            <div>
              <Badge tone="patient">Yêu cầu đăng nhập</Badge>
              <h2 id="unauth-guard-heading" className="mt-1 text-lg font-bold text-slate-900">
                Vui lòng đăng nhập để tiếp tục
              </h2>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-600">
            Bạn cần đăng nhập bằng tài khoản Suncare để truy cập chức năng này. Sau khi đăng nhập
            thành công, hệ thống sẽ chuyển bạn trở lại trang đang yêu cầu.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <RouteLink
              to="/login"
              state={{ returnTo: path }}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <AppIcon name="login" className="text-xs" />
              <span>Đăng nhập ngay</span>
            </RouteLink>
            <RouteLink
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span>Đăng ký hồ sơ Bệnh nhân</span>
            </RouteLink>
          </div>
        </section>
      )
    }

    if (evaluation.reason === 'ACCOUNT_LOCKED') {
      return (
        <AccountLockedBanner
          correlationId={lockedError?.correlationId || null}
          onSignOut={() => logout('Đã đăng xuất khỏi tài khoản bị khóa.')}
        />
      )
    }

    return (
      <AccessDeniedView
        title="Không có quyền truy cập chức năng này"
        reason={
          evaluation.reason === 'WRONG_ACCOUNT_TYPE'
            ? requiredAccountType === 'PATIENT'
              ? 'Trang này dành riêng cho Cổng thông tin Bệnh nhân.'
              : 'Trang này dành riêng cho Nhân viên y tế thuộc Phòng khám Suncare.'
            : 'Tài khoản của bạn hiện chưa được phân công vai trò hoặc quyền nghiệp vụ cho mục này.'
        }
        requiredRoles={requiredRoles}
        principal={principal}
      />
    )
  }

  return children
}

export function GuestOnlyRoute({ children }) {
  const { status, principal } = useAuth()

  if (status === 'initializing') {
    return (
      <AsyncStateView
        status="loading"
        loadingText="Đang kiểm tra trạng thái đăng nhập..."
      />
    )
  }

  if (status === 'authenticated' && principal) {
    const targetHome = resolveDefaultHomeForPrincipal(principal)
    return (
      <section className="mx-auto max-w-lg rounded-2xl border border-teal-200 bg-white p-8 shadow-2xs space-y-4">
        <Badge tone="success" dot>
          Đang đăng nhập
        </Badge>
        <h2 className="text-xl font-bold text-slate-900">
          Xin chào, {principal.fullName}
        </h2>
        <p className="text-sm text-slate-600">
          Mã hồ sơ: <strong className="text-slate-900">{principal.profileCode}</strong> • Vai trò:{' '}
          <strong className="text-slate-900">
            {(principal.roles || []).map(formatRoleLabel).join(', ')}
          </strong>
        </p>
        <div className="pt-2">
          <RouteLink
            to={targetHome}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <span>
              {principal.accountType === 'PATIENT'
                ? 'Đi tới Cổng thông tin Bệnh nhân'
                : 'Đi tới Bàn làm việc Nhân viên'}
            </span>
            <AppIcon name="arrow-right" className="text-xs" />
          </RouteLink>
        </div>
      </section>
    )
  }

  return children
}
