import { useState } from 'react'
import { RouteLink } from '@/app/router'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { ProblemAlert } from '@/components/common/ProblemAlert'
import { AppIcon } from '@/components/ui/AppIcon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { InputField } from '@/components/ui/InputField'
import { authApi } from '@/features/auth/authApi'
import { useAuth } from '@/features/auth/useAuth'

const MEDICAL_RECORDS_COLUMNS = [
  { key: 'encounterDate', header: 'Ngày khám' },
  { key: 'specialty', header: 'Chuyên khoa' },
  { key: 'visitType', header: 'Hình thức' },
  { key: 'diagnosis', header: 'Chẩn đoán chính' },
  { key: 'status', header: 'Trạng thái hồ sơ' },
]

const LAB_RESULTS_COLUMNS = [
  { key: 'orderCode', header: 'Mã chỉ định' },
  { key: 'serviceName', header: 'Dịch vụ cận lâm sàng' },
  { key: 'publishedAt', header: 'Thời điểm công bố' },
  { key: 'version', header: 'Phiên bản kết quả' },
  { key: 'status', header: 'Trạng thái' },
]

export function PatientWorkspacePage({ section = 'overview' }) {
  const { principal, updateProfile } = useAuth()

  const [profileForm, setProfileForm] = useState({
    fullName: principal?.fullName || '',
    phone: '',
    email: '',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
  })
  const [profileState, setProfileState] = useState({
    isSaving: false,
    error: null,
    successMessage: null,
  })

  const [scopeCheckResult, setScopeCheckResult] = useState({
    status: 'idle',
    data: null,
    error: null,
  })

  const handleProfileSave = async (event) => {
    event.preventDefault()
    if (!profileForm.fullName.trim()) {
      setProfileState({
        isSaving: false,
        error: {
          title: 'Thiếu thông tin bắt buộc',
          detail: 'Họ và tên người bệnh không được để trống.',
        },
        successMessage: null,
      })
      return
    }

    setProfileState({ isSaving: true, error: null, successMessage: null })
    try {
      const updated = await updateProfile({
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim() || null,
        email: profileForm.email.trim() || null,
        address: profileForm.address.trim() || null,
        emergencyName: profileForm.emergencyName.trim() || null,
        emergencyPhone: profileForm.emergencyPhone.trim() || null,
      })
      setProfileState({
        isSaving: false,
        error: null,
        successMessage: `Đã lưu cập nhật thông tin liên hệ cho hồ sơ ${updated.profileCode} (${updated.fullName}).`,
      })
    } catch (err) {
      setProfileState({ isSaving: false, error: err, successMessage: null })
    }
  }

  const handleVerifyRecordAccess = async () => {
    if (!principal?.patientId) return
    setScopeCheckResult({ status: 'loading', data: null, error: null })
    try {
      const payload = await authApi.checkPatientSelfScope(principal.patientId)
      setScopeCheckResult({ status: 'success', data: payload, error: null })
    } catch (err) {
      setScopeCheckResult({ status: 'error', data: null, error: err })
    }
  }

  if (section === 'booking-onsite') {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Đặt lịch khám ngoại trú"
          title="Đặt khám trực tiếp tại cơ sở"
          description="Đăng ký khám theo chuyên khoa, ngày khám và buổi Sáng hoặc Chiều. Bác sĩ được hệ thống phân công tự động để đảm bảo thời gian tiếp nhận công bằng."
          actions={
            <RouteLink
              to="/patient/booking-online"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <AppIcon name="video" className="text-xs text-teal-700" />
              <span>Chuyển sang Khám trực tuyến</span>
            </RouteLink>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                <span>Bước 01</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Chọn chuyên khoa</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Lựa chọn chuyên khoa phù hợp với triệu chứng hoặc nhu cầu kiểm tra sức khỏe của
                bạn.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                <span>Bước 02</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Chọn ngày &amp; buổi khám</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Chọn ngày đến khám và buổi Sáng hoặc buổi Chiều. Khám trực tiếp không yêu cầu chọn
                trước bác sĩ hay khung giờ lẻ.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                <span>Bước 03</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Nhận phiếu hẹn &amp; đến khám</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Hệ thống phân công bác sĩ công bằng theo số lượng tiếp nhận thực tế và khởi tạo
                lượt khám tại quầy chuyên khoa.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-base font-bold text-slate-900">
              Danh sách ca khám trực tiếp đang mở đăng ký
            </h3>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon="hospital"
              title="Chưa có lịch trực chuyên khoa được công bố cho ngày được chọn"
              description="Khi các chuyên khoa công bố lịch trực ca Sáng và ca Chiều trên hệ thống, bạn có thể chọn ngày và xác nhận đặt lịch trực tiếp tại đây."
              action={
                <RouteLink
                  to="/patient"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <span>Quay lại Tổng quan</span>
                </RouteLink>
              }
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (section === 'booking-online') {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Tư vấn y tế từ xa"
          title="Đặt lịch khám trực tuyến qua Video"
          description="Lựa chọn khung giờ tư vấn 20 phút phù hợp. Lịch hẹn được giữ chỗ tạm thời trong 5 phút và được xác nhận ngay sau khi thanh toán MoMo thành công."
          actions={
            <RouteLink
              to="/patient/booking-onsite"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <AppIcon name="hospital" className="text-xs text-teal-700" />
              <span>Đặt khám tại cơ sở</span>
            </RouteLink>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-teal-700">
                <AppIcon name="clock" />
                <span className="text-xs font-bold uppercase tracking-wider">Khung giờ 20 phút</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Tùy chọn bác sĩ &amp; giờ hẹn</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Xem các khung giờ 20 phút còn trống của chuyên khoa và tùy chọn bác sĩ tư vấn theo
                lịch đã công bố.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-teal-700">
                <AppIcon name="credit-card" />
                <span className="text-xs font-bold uppercase tracking-wider">Giữ chỗ 5 phút</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Xác nhận qua thanh toán MoMo</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Khung giờ được giữ tạm thời tối đa 5 phút. Lịch hẹn chính thức chỉ được tạo sau khi
                hệ thống xác nhận thanh toán thành công.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-teal-700">
                <AppIcon name="calendar-days" />
                <span className="text-xs font-bold uppercase tracking-wider">Quy định hủy lịch</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Hủy trước ít nhất 24 giờ</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Lịch hẹn trực tuyến có thể hủy trước giờ khám tối thiểu 24 giờ theo quy định của
                phòng khám. Không áp dụng đổi giờ hẹn.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-base font-bold text-slate-900">
              Khung giờ tư vấn trực tuyến khả dụng
            </h3>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon="video"
              title="Hiện chưa có khung giờ khám trực tuyến đang mở"
              description="Các khung giờ tư vấn trực tuyến 20 phút sẽ hiển thị tại đây ngay khi lịch làm việc trực tuyến của các khoa được công bố."
              action={
                <RouteLink
                  to="/patient"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <span>Quay lại Tổng quan</span>
                </RouteLink>
              }
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (section === 'records') {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Hồ sơ y tế cá nhân"
          title="Hồ sơ sức khỏe &amp; Kết quả cận lâm sàng"
          description="Tra cứu lịch sử các lượt khám ngoại trú, đơn thuốc và các phiên bản kết quả xét nghiệm, chẩn đoán hình ảnh đã được bác sĩ công bố."
          actions={
            <Button
              variant="outline"
              size="sm"
              isLoading={scopeCheckResult.status === 'loading'}
              onClick={handleVerifyRecordAccess}
            >
              <AppIcon name="shield" className="text-teal-700" />
              <span>Kiểm tra quyền truy cập hồ sơ</span>
            </Button>
          }
        />

        {scopeCheckResult.status === 'error' && (
          <ProblemAlert error={scopeCheckResult.error} />
        )}

        {scopeCheckResult.status === 'success' && scopeCheckResult.data && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-3.5 text-xs text-emerald-950"
          >
            <div className="flex items-center gap-2.5">
              <AppIcon name="circle-check" className="text-emerald-700 text-sm" />
              <span>
                Đã xác thực quyền truy cập bảo mật cho hồ sơ bệnh nhân{' '}
                <strong>{principal?.profileCode}</strong> ({principal?.fullName}).
              </span>
            </div>
            <Badge tone="success">Hợp lệ</Badge>
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Lịch sử lượt khám &amp; Đơn thuốc</h3>
              <p className="text-xs text-slate-500">
                Các lượt khám đã hoàn tất tại Suncare sẽ được lưu trữ tại đây.
              </p>
            </div>
            <Badge tone="neutral">Mã BN: {principal?.profileCode}</Badge>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={MEDICAL_RECORDS_COLUMNS}
              rows={[]}
              emptyIcon="file-medical"
              emptyTitle="Chưa có lịch sử lượt khám"
              emptyDescription="Thông tin chẩn đoán, hướng điều trị và đơn thuốc (nếu có) sẽ hiển thị sau khi bác sĩ hoàn tất lượt khám."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-base font-bold text-slate-900">
              Kết quả Cận lâm sàng đã công bố
            </h3>
            <p className="text-xs text-slate-500">
              Chỉ hiển thị các kết quả xét nghiệm và chẩn đoán hình ảnh đã được phát hành chính thức.
            </p>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={LAB_RESULTS_COLUMNS}
              rows={[]}
              emptyIcon="flask"
              emptyTitle="Chưa có kết quả cận lâm sàng"
              emptyDescription="Khi kết quả xét nghiệm hoặc chẩn đoán hình ảnh được công bố, bạn có thể xem chi tiết tại mục này."
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (section === 'profile') {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Quản lý tài khoản"
          title="Thông tin cá nhân &amp; Liên hệ"
          description="Cập nhật họ tên, số điện thoại, địa chỉ và người liên hệ khẩn cấp để phòng khám liên lạc khi cần thiết."
        />

        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-4 h-fit">
            <CardHeader>
              <h3 className="text-base font-bold text-slate-900">Định danh hồ sơ</h3>
              <p className="text-xs text-slate-500">
                Thông tin định danh cố định của người bệnh tại Suncare.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Mã hồ sơ bệnh nhân</p>
                  <p className="mt-0.5 font-mono text-base font-bold text-teal-800">
                    {principal?.profileCode}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tên đăng nhập</p>
                  <p className="mt-0.5 font-mono font-medium text-slate-900">
                    {principal?.loginName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Trạng thái tài khoản</p>
                  <div className="mt-1">
                    <Badge tone="success" dot>
                      Đang hoạt động
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                Mã bệnh nhân và tên đăng nhập được gắn cố định với hồ sơ y tế để bảo đảm tính toàn
                vẹn của lịch sử khám chữa bệnh.
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-8">
            <CardHeader>
              <h3 className="text-base font-bold text-slate-900">Cập nhật thông tin liên hệ</h3>
            </CardHeader>
            <CardContent className="space-y-5">
              {profileState.error && <ProblemAlert error={profileState.error} />}
              {profileState.successMessage && (
                <div
                  role="status"
                  className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900"
                >
                  <AppIcon name="circle-check" className="text-emerald-700" />
                  <span>{profileState.successMessage}</span>
                </div>
              )}

              <form onSubmit={handleProfileSave} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    id="pat-prof-fullName"
                    label="Họ và tên người bệnh"
                    required
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                  />
                  <InputField
                    id="pat-prof-phone"
                    label="Số điện thoại"
                    type="tel"
                    placeholder="Nhập số điện thoại liên hệ"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    id="pat-prof-email"
                    label="Địa chỉ Email"
                    type="email"
                    placeholder="benhnhan@example.com"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                  <InputField
                    id="pat-prof-address"
                    label="Địa chỉ cư trú"
                    placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố"
                    value={profileForm.address}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4">
                  <InputField
                    id="pat-prof-emergencyName"
                    label="Người liên hệ khẩn cấp"
                    placeholder="Họ và tên người thân"
                    value={profileForm.emergencyName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, emergencyName: e.target.value }))
                    }
                  />
                  <InputField
                    id="pat-prof-emergencyPhone"
                    label="Số điện thoại khẩn cấp"
                    type="tel"
                    placeholder="Số điện thoại người thân"
                    value={profileForm.emergencyPhone}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, emergencyPhone: e.target.value }))
                    }
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="patient" isLoading={profileState.isSaving}>
                    <AppIcon name="check" className="text-xs" />
                    <span>Lưu thông tin hồ sơ</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Default: 'overview' (/patient)
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="rounded-3xl border border-teal-100 bg-gradient-to-r from-white via-teal-50/40 to-white p-6 shadow-2xs sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="patient" dot>
                Mã hồ sơ: {principal?.profileCode}
              </Badge>
              <Badge tone="success">Đang hoạt động</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Xin chào, {principal?.fullName}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
              Chào mừng bạn đến với Cổng thông tin Bệnh nhân Suncare. Tại đây bạn có thể đăng ký
              khám ngoại trú, đặt lịch tư vấn trực tuyến và theo dõi hồ sơ sức khỏe cá nhân.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <RouteLink
              to="/patient/booking-onsite"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-teal-800"
            >
              <AppIcon name="hospital" className="text-xs" />
              <span>Đặt khám tại cơ sở</span>
            </RouteLink>
            <RouteLink
              to="/patient/booking-online"
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/70 px-4 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-100/80"
            >
              <AppIcon name="video" className="text-xs text-teal-700" />
              <span>Đặt khám trực tuyến</span>
            </RouteLink>
          </div>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Lịch hẹn khám của bạn</h3>
              <p className="text-xs text-slate-500">
                Các lịch hẹn khám tại cơ sở và khám trực tuyến sắp tới
              </p>
            </div>
            <AppIcon name="calendar-check" className="text-teal-700" />
          </CardHeader>
          <CardContent>
            <EmptyState
              icon="calendar-days"
              title="Chưa có lịch hẹn khám sắp tới"
              description="Bạn hiện chưa có lịch hẹn nào đang chờ khám. Hãy chọn hình thức khám phù hợp để đặt lịch mới."
              action={
                <>
                  <RouteLink
                    to="/patient/booking-onsite"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-800"
                  >
                    <span>Đặt khám tại cơ sở</span>
                  </RouteLink>
                  <RouteLink
                    to="/patient/booking-online"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <span>Khám trực tuyến</span>
                  </RouteLink>
                </>
              }
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Thông tin hồ sơ cá nhân</h3>
              <p className="text-xs text-slate-500">Tóm tắt tài khoản người bệnh</p>
            </div>
            <RouteLink
              to="/patient/profile"
              className="text-xs font-semibold text-teal-700 hover:text-teal-900"
            >
              Chỉnh sửa →
            </RouteLink>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-xs text-slate-500">Họ và tên</dt>
                <dd className="font-semibold text-slate-900">{principal?.fullName}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-xs text-slate-500">Mã bệnh nhân</dt>
                <dd className="font-mono font-bold text-teal-800">{principal?.profileCode}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-xs text-slate-500">Tài khoản đăng nhập</dt>
                <dd className="font-mono text-slate-700">{principal?.loginName}</dd>
              </div>
            </dl>

            <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800">Lưu ý khi đi khám</p>
              <p className="leading-relaxed">
                Vui lòng xuất trình Mã bệnh nhân <strong>{principal?.profileCode}</strong> và căn
                cước công dân tại quầy tiếp đón khi đến khám trực tiếp tại phòng khám.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Medical Records Section */}
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kết quả khám &amp; Cận lâm sàng gần đây
            </h3>
            <p className="text-xs text-slate-500">
              Tóm tắt các kết quả xét nghiệm, chẩn đoán hình ảnh và đơn thuốc đã phát hành
            </p>
          </div>
          <RouteLink
            to="/patient/records"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900"
          >
            <span>Xem toàn bộ hồ sơ</span>
            <AppIcon name="arrow-right" className="text-[10px]" />
          </RouteLink>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon="file-medical"
            title="Chưa có kết quả khám hoặc cận lâm sàng nào được công bố"
            description="Sau khi hoàn tất lượt khám hoặc khi kết quả xét nghiệm được bác sĩ công bố, thông tin chi tiết sẽ xuất hiện tại đây."
          />
        </CardContent>
      </Card>
    </div>
  )
}
