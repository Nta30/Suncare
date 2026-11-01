import { useState } from 'react'
import { RouteLink } from '@/app/router'
import { useRouter } from '@/app/routerContext'
import { ProblemAlert } from '@/components/common/ProblemAlert'
import { AppIcon } from '@/components/ui/AppIcon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { InputField } from '@/components/ui/InputField'
import { validatePatientRegistrationInput } from '@/features/auth/authEvaluation'
import { useAuth } from '@/features/auth/useAuth'

const SEX_OPTIONS = [
  { value: '', label: '-- Chọn giới tính --' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'MALE', label: 'Nam' },
  { value: 'OTHER', label: 'Khác' },
]

function createAttemptIdempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `reg-${crypto.randomUUID()}`
  }
  return `reg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function PatientRegisterPage() {
  const { registerPatient } = useAuth()
  const { navigate } = useRouter()

  const [form, setForm] = useState({
    loginName: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    birthDate: '',
    sex: '',
    phone: '',
    email: '',
    identityNumber: '',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
  })

  const [idempotencyKey, setIdempotencyKey] = useState(() => createAttemptIdempotencyKey())
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdPrincipal, setCreatedPrincipal] = useState(null)

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }))
    }
    if (submitError) {
      setIdempotencyKey(createAttemptIdempotencyKey())
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError(null)

    const validation = validatePatientRegistrationInput(form)
    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    try {
      const created = await registerPatient(validation.payload, { idempotencyKey })
      setCreatedPrincipal(created)
    } catch (err) {
      setSubmitError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (createdPrincipal) {
    return (
      <Card className="mx-auto max-w-2xl border-emerald-200">
        <CardHeader className="bg-emerald-50/60 space-y-2">
          <Badge tone="success" dot>
            Khởi tạo hồ sơ thành công
          </Badge>
          <h2 className="text-2xl font-bold text-slate-900">
            Hồ sơ bệnh nhân của bạn đã sẵn sàng
          </h2>
          <p className="text-sm text-slate-600">
            Vui lòng lưu lại mã bệnh nhân và tên đăng nhập dưới đây để sử dụng khi đặt lịch khám
            hoặc tra cứu kết quả.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 text-sm">
          <dl className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div>
              <dt className="text-xs font-medium text-slate-500">Họ và tên người bệnh</dt>
              <dd className="mt-1 font-semibold text-slate-900">{createdPrincipal.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Mã hồ sơ bệnh nhân</dt>
              <dd className="mt-1 font-mono font-bold text-teal-800">
                {createdPrincipal.profileCode}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Tên đăng nhập</dt>
              <dd className="mt-1 font-mono font-medium text-slate-900">
                {createdPrincipal.loginName}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Loại hồ sơ</dt>
              <dd className="mt-1 font-medium text-slate-900">Bệnh nhân ngoại trú</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="patient"
              size="lg"
              onClick={() =>
                navigate('/login', {
                  state: { prefillLoginName: createdPrincipal.loginName },
                })
              }
            >
              <span>Đăng nhập ngay</span>
              <AppIcon name="arrow-right" className="text-xs" />
            </Button>
            <RouteLink
              to="/"
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Về trang chủ
            </RouteLink>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Cổng thông tin Bệnh nhân Suncare
            </p>
            <Badge tone="patient">Đăng ký trực tuyến</Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Đăng ký hồ sơ bệnh nhân mới
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Điền thông tin bên dưới để khởi tạo mã hồ sơ bệnh nhân cá nhân, phục vụ đặt lịch khám
            trực tiếp tại cơ sở hoặc tư vấn khám trực tuyến.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {submitError && (
            <ProblemAlert error={submitError} onDismiss={() => setSubmitError(null)} />
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            <fieldset className="space-y-4">
              <legend className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-800 ring-1 ring-teal-200">
                  1
                </span>
                <span>Thông tin tài khoản đăng nhập</span>
              </legend>
              <div className="grid gap-4 sm:grid-cols-3 pt-1">
                <InputField
                  id="reg-loginName"
                  name="loginName"
                  label="Tên đăng nhập"
                  required
                  autoComplete="username"
                  placeholder="Ví dụ: nguyenvana"
                  value={form.loginName}
                  onChange={handleChange('loginName')}
                  error={fieldErrors.loginName}
                  hint="Từ 3 đến 100 ký tự, viết liền không dấu."
                  disabled={isSubmitting}
                />
                <InputField
                  id="reg-password"
                  name="password"
                  type="password"
                  label="Mật khẩu"
                  required
                  autoComplete="new-password"
                  placeholder="Tối thiểu 8 ký tự"
                  value={form.password}
                  onChange={handleChange('password')}
                  error={fieldErrors.password}
                  disabled={isSubmitting}
                />
                <InputField
                  id="reg-confirmPassword"
                  name="confirmPassword"
                  type="password"
                  label="Xác nhận mật khẩu"
                  required
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  error={fieldErrors.confirmPassword}
                  disabled={isSubmitting}
                />
              </div>
            </fieldset>

            <fieldset className="space-y-4 border-t border-slate-100 pt-6">
              <legend className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-800 ring-1 ring-teal-200">
                  2
                </span>
                <span>Thông tin hành chính người bệnh</span>
              </legend>
              <div className="grid gap-4 sm:grid-cols-3 pt-1">
                <InputField
                  id="reg-fullName"
                  name="fullName"
                  label="Họ và tên người bệnh"
                  required
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={handleChange('fullName')}
                  error={fieldErrors.fullName}
                  disabled={isSubmitting}
                />
                <InputField
                  id="reg-birthDate"
                  name="birthDate"
                  type="date"
                  label="Ngày sinh"
                  value={form.birthDate}
                  onChange={handleChange('birthDate')}
                  error={fieldErrors.birthDate}
                  disabled={isSubmitting}
                />
                <InputField
                  id="reg-sex"
                  name="sex"
                  as="select"
                  label="Giới tính"
                  options={SEX_OPTIONS}
                  value={form.sex}
                  onChange={handleChange('sex')}
                  error={fieldErrors.sex}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <InputField
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  label="Số điện thoại"
                  autoComplete="tel"
                  placeholder="0901234567"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  error={fieldErrors.phone}
                  disabled={isSubmitting}
                />
                <InputField
                  id="reg-email"
                  name="email"
                  type="email"
                  label="Email liên hệ"
                  autoComplete="email"
                  placeholder="tenban@example.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  error={fieldErrors.email}
                  disabled={isSubmitting}
                />
                <InputField
                  id="reg-identityNumber"
                  name="identityNumber"
                  label="Số CCCD / Định danh cá nhân"
                  placeholder="Nhập 12 chữ số CCCD"
                  value={form.identityNumber}
                  onChange={handleChange('identityNumber')}
                  error={fieldErrors.identityNumber}
                  disabled={isSubmitting}
                />
              </div>

              <InputField
                id="reg-address"
                name="address"
                label="Địa chỉ thường trú / liên hệ"
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                value={form.address}
                onChange={handleChange('address')}
                error={fieldErrors.address}
                disabled={isSubmitting}
              />
            </fieldset>

            <fieldset className="space-y-4 border-t border-slate-100 pt-6">
              <legend className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-800 ring-1 ring-teal-200">
                  3
                </span>
                <span>Người liên hệ khi cần thiết (không bắt buộc)</span>
              </legend>
              <div className="grid gap-4 sm:grid-cols-2 pt-1">
                <InputField
                  id="reg-emergencyName"
                  name="emergencyName"
                  label="Họ và tên người thân"
                  placeholder="Trần Thị B"
                  value={form.emergencyName}
                  onChange={handleChange('emergencyName')}
                  disabled={isSubmitting}
                />
                <InputField
                  id="reg-emergencyPhone"
                  name="emergencyPhone"
                  type="tel"
                  label="Số điện thoại người thân"
                  placeholder="0909876543"
                  value={form.emergencyPhone}
                  onChange={handleChange('emergencyPhone')}
                  disabled={isSubmitting}
                />
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
              <p className="text-xs text-slate-500">
                Các trường đánh dấu <span className="text-red-600">*</span> là thông tin bắt buộc.
              </p>
              <Button type="submit" variant="patient" size="lg" isLoading={isSubmitting}>
                <AppIcon name="user-plus" className="text-xs" />
                <span>{isSubmitting ? 'Đang khởi tạo hồ sơ...' : 'Hoàn tất đăng ký hồ sơ'}</span>
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <span>Bạn đã có mã hồ sơ hoặc tài khoản Suncare?</span>
          <RouteLink
            to="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-teal-900"
          >
            <span>Đăng nhập ngay</span>
            <AppIcon name="arrow-right" className="text-[10px]" />
          </RouteLink>
        </CardFooter>
      </Card>
    </div>
  )
}
