import { useState } from 'react'
import { RouteLink } from '@/app/router'
import { useRouter } from '@/app/routerContext'
import { AccountLockedBanner } from '@/components/common/AccountLockedBanner'
import { ProblemAlert } from '@/components/common/ProblemAlert'
import { AppIcon } from '@/components/ui/AppIcon'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { InputField } from '@/components/ui/InputField'
import {
  resolveDefaultHomeForPrincipal,
  validateLoginInput,
} from '@/features/auth/authEvaluation'
import { useAuth } from '@/features/auth/useAuth'

export function LoginPage() {
  const { login, status, lockedError } = useAuth()
  const { navigate, routeState } = useRouter()

  const [form, setForm] = useState({
    loginName: routeState?.prefillLoginName || '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError(null)

    const validation = validateLoginInput(form)
    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      return
    }
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      const session = await login(validation.sanitized)
      const returnTo = routeState?.returnTo
      const defaultRoute = resolveDefaultHomeForPrincipal(session?.principal)

      if (
        returnTo &&
        ((session?.principal?.accountType === 'PATIENT' && returnTo.startsWith('/patient')) ||
          (session?.principal?.accountType === 'STAFF' && returnTo.startsWith('/staff')))
      ) {
        navigate(returnTo, { replace: true })
      } else {
        navigate(defaultRoute, { replace: true })
      }
    } catch (err) {
      setSubmitError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl py-2 sm:py-6">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
        {/* Left Informational Panel */}
        <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-slate-900 p-8 text-white shadow-sm lg:col-span-5">
          <div className="space-y-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-xs">
              <AppIcon name="heart-pulse" className="text-xl" />
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-200">
                Phòng khám Đa khoa Suncare
              </p>
              <h1 className="text-2xl font-bold leading-snug text-white">
                Cổng thông tin Y tế &amp; Quản lý Khám ngoại trú
              </h1>
              <p className="text-sm leading-relaxed text-teal-100/90">
                Đăng nhập để đặt lịch khám chuyên khoa, theo dõi kết quả cận lâm sàng hoặc truy
                cập bàn làm việc chuyên môn dành cho đội ngũ y tế.
              </p>
            </div>

            <div className="space-y-3 border-t border-white/15 pt-5 text-xs text-teal-50">
              <div className="flex items-start gap-3">
                <AppIcon name="circle-check" className="mt-0.5 text-teal-300" />
                <span>
                  <strong className="font-semibold text-white">Dành cho Bệnh nhân:</strong> Đặt
                  khám trực tiếp hoặc trực tuyến, quản lý lịch hẹn và xem hồ sơ sức khỏe cá nhân.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <AppIcon name="user-doctor" className="mt-0.5 text-teal-300" />
                <span>
                  <strong className="font-semibold text-white">Dành cho Nhân viên y tế:</strong>{' '}
                  Tiếp nhận lượt khám, xử lý cận lâm sàng, điều phối lịch trực và thu ngân nội bộ.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white/10 p-4 text-xs text-teal-100">
            <p className="font-semibold text-white">Hỗ trợ người bệnh</p>
            <p className="mt-1 leading-relaxed">
              Nếu bạn đến khám lần đầu và chưa có mã hồ sơ bệnh nhân, vui lòng chọn{' '}
              <RouteLink to="/register" className="font-semibold text-white underline">
                Đăng ký hồ sơ mới
              </RouteLink>{' '}
              để khởi tạo tài khoản trực tuyến.
            </p>
          </div>
        </div>

        {/* Right Form Card */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <CardHeader className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Chào mừng trở lại
            </p>
            <h2 className="text-2xl font-bold text-slate-900">Đăng nhập tài khoản</h2>
            <p className="text-sm text-slate-600">
              Nhập tên đăng nhập và mật khẩu để truy cập hệ thống Suncare.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {routeState?.returnTo && (
              <div className="flex items-center gap-2.5 rounded-xl border border-teal-200 bg-teal-50/70 px-4 py-3 text-xs text-teal-900">
                <AppIcon name="circle-info" className="text-teal-700" />
                <span>
                  Vui lòng đăng nhập để tiếp tục truy cập trang bạn vừa yêu cầu.
                </span>
              </div>
            )}

            {routeState?.prefillLoginName && !submitError && (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-xs text-emerald-900">
                <AppIcon name="circle-check" className="text-emerald-700" />
                <span>
                  Tài khoản <strong>{routeState.prefillLoginName}</strong> đã được tạo. Vui lòng
                  nhập mật khẩu để đăng nhập.
                </span>
              </div>
            )}

            {(status === 'locked' || submitError?.code === 'ACCOUNT_LOCKED') && (
              <AccountLockedBanner
                detail={submitError?.detail || lockedError?.detail}
                correlationId={submitError?.correlationId || lockedError?.correlationId}
              />
            )}

            {submitError && submitError.code !== 'ACCOUNT_LOCKED' && (
              <ProblemAlert
                error={submitError}
                onDismiss={() => setSubmitError(null)}
              />
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <InputField
                id="login-loginName"
                name="loginName"
                label="Tên đăng nhập"
                required
                autoComplete="username"
                placeholder="Nhập tên đăng nhập của bạn"
                value={form.loginName}
                onChange={handleChange('loginName')}
                error={fieldErrors.loginName}
                disabled={isSubmitting}
              />

              <InputField
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Mật khẩu"
                required
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange('password')}
                error={fieldErrors.password}
                disabled={isSubmitting}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                }
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="patient"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span>Bạn là bệnh nhân mới chưa có tài khoản?</span>
            <RouteLink
              to="/register"
              className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-teal-900"
            >
              <span>Đăng ký hồ sơ Bệnh nhân</span>
              <AppIcon name="arrow-right" className="text-[10px]" />
            </RouteLink>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
