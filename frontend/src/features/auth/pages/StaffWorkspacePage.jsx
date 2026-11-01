import { useState } from 'react'
import { RouteLink } from '@/app/router'
import { DataTable } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { ProblemAlert } from '@/components/common/ProblemAlert'
import { AppIcon } from '@/components/ui/AppIcon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { InputField } from '@/components/ui/InputField'
import { authApi } from '@/features/auth/authApi'
import { ROLE_METADATA, STAFF_NAV_ITEMS } from '@/features/auth/authConstants'
import {
  filterNavigationForPrincipal,
  formatRoleLabel,
} from '@/features/auth/authEvaluation'
import { useAuth } from '@/features/auth/useAuth'

const STAFF_ROLES_OPTIONS = ['DOCTOR', 'LAB_STAFF', 'DEPARTMENT_HEAD', 'CASHIER', 'SYSTEM_ADMIN']

const CLINICAL_MODULE_CONFIG = Object.freeze({
  encounters: {
    eyebrow: 'Lâm sàng & Điều trị',
    title: 'Khám bệnh & Chỉ định Cận lâm sàng',
    description:
      'Tiếp nhận lượt khám được phân công, ghi nhận sinh hiệu, chẩn đoán, lập chỉ định cận lâm sàng và kê đơn thuốc ngoại trú.',
    emptyIcon: 'stethoscope',
    emptyTitle: 'Chưa có lượt khám nào đang chờ tiếp nhận',
    emptyDescription:
      'Các lượt khám trực tiếp và trực tuyến được phân công cho bác sĩ trong ca trực sẽ hiển thị tại bảng điều phối này.',
    columns: [
      { key: 'encounterCode', header: 'Mã lượt khám' },
      { key: 'patientName', header: 'Người bệnh' },
      { key: 'visitChannel', header: 'Hình thức khám' },
      { key: 'shiftOrSlot', header: 'Buổi / Khung giờ' },
      { key: 'status', header: 'Trạng thái' },
    ],
  },
  lab: {
    eyebrow: 'Xét nghiệm & Chẩn đoán hình ảnh',
    title: 'Hàng đợi Cận lâm sàng',
    description:
      'Tiếp nhận chỉ định đã đủ điều kiện thực hiện, ghi nhận tiến độ xử lý và phát hành phiên bản kết quả cận lâm sàng.',
    emptyIcon: 'flask',
    emptyTitle: 'Hàng đợi cận lâm sàng hiện đang trống',
    emptyDescription:
      'Các chỉ định cận lâm sàng đã hoàn tất phân bổ thanh toán và còn trong thời hạn hiệu lực sẽ xuất hiện tại đây.',
    columns: [
      { key: 'orderCode', header: 'Mã chỉ định' },
      { key: 'patientName', header: 'Người bệnh' },
      { key: 'serviceName', header: 'Dịch vụ cận lâm sàng' },
      { key: 'expiresAt', header: 'Hạn hiệu lực' },
      { key: 'status', header: 'Trạng thái xử lý' },
    ],
  },
  scheduling: {
    eyebrow: 'Điều phối chuyên khoa',
    title: 'Lịch trực & Phân công nhân sự',
    description:
      'Quản lý lịch làm việc theo khoa, công bố ca khám trực tiếp (Sáng/Chiều) và khung giờ khám trực tuyến 20 phút.',
    emptyIcon: 'calendar-days',
    emptyTitle: 'Chưa có lịch phân công ca trực trong kỳ đang chọn',
    emptyDescription:
      'Lịch trực chuyên khoa sau khi được khởi tạo và công bố sẽ hiển thị chi tiết theo từng ngày làm việc.',
    columns: [
      { key: 'workDate', header: 'Ngày làm việc' },
      { key: 'shiftName', header: 'Ca trực' },
      { key: 'staffName', header: 'Nhân sự phụ trách' },
      { key: 'capacity', header: 'Sức chứa / Đã đặt' },
      { key: 'status', header: 'Trạng thái công bố' },
    ],
  },
  billing: {
    eyebrow: 'Tài chính bệnh nhân',
    title: 'Thu ngân & Quản lý Hoàn tiền',
    description:
      'Quản lý chứng từ thu phí dịch vụ nội bộ, ghi nhận thu tiền mặt, đối soát giao dịch trực tuyến và xử lý hoàn tiền thủ công.',
    emptyIcon: 'credit-card',
    emptyTitle: 'Chưa có chứng từ thu hoặc yêu cầu hoàn tiền cần xử lý',
    emptyDescription:
      'Các chứng từ thu phát sinh từ khám trực tiếp, chỉ định cận lâm sàng hoặc yêu cầu hoàn tiền sẽ được liệt kê tại đây.',
    columns: [
      { key: 'invoiceCode', header: 'Mã chứng từ' },
      { key: 'patientName', header: 'Người bệnh' },
      { key: 'invoiceType', header: 'Loại chứng từ' },
      { key: 'totalAmount', header: 'Số tiền (VND)', align: 'right' },
      { key: 'status', header: 'Trạng thái thanh toán' },
    ],
  },
  reports: {
    eyebrow: 'Tổng hợp & Phân tích',
    title: 'Báo cáo thống kê hoạt động',
    description:
      'Theo dõi số liệu lượt khám, công suất cận lâm sàng và tình hình thu - hoàn phí theo phạm vi khoa hoặc toàn phòng khám.',
    emptyIcon: 'chart-line',
    emptyTitle: 'Chưa có dữ liệu báo cáo trong kỳ truy vấn',
    emptyDescription:
      'Báo cáo tổng hợp sẽ được trích xuất chính xác từ dữ liệu lượt khám và chứng từ tài chính theo múi giờ Việt Nam (GMT+7).',
    columns: [
      { key: 'reportDate', header: 'Ngày ghi nhận' },
      { key: 'department', header: 'Chuyên khoa' },
      { key: 'encounterCount', header: 'Số lượt khám' },
      { key: 'clsCount', header: 'Chỉ định CLS' },
      { key: 'status', header: 'Trạng thái đối soát' },
    ],
  },
})

export function StaffWorkspacePage({ section = 'overview' }) {
  const { principal, updateProfile } = useAuth()
  const isSystemAdmin = (principal?.roles || []).includes('SYSTEM_ADMIN')

  const [scopeCheck, setScopeCheck] = useState({
    departmentId: String(
      principal?.headDepartmentIds?.[0] || principal?.primaryDepartmentId || 1
    ),
    doctorStaffId: String(principal?.staffId || 1),
    status: 'idle',
    result: null,
    error: null,
  })

  const [managedAccounts, setManagedAccounts] = useState([])

  const [provisionForm, setProvisionForm] = useState({
    loginName: '',
    password: '',
    staffCode: '',
    fullName: '',
    email: '',
    phone: '',
    qualification: '',
    professionalLicense: '',
    primaryDepartmentId: '',
    selectedRoles: ['DOCTOR'],
  })
  const [provisionState, setProvisionState] = useState({
    isSubmitting: false,
    created: null,
    error: null,
  })

  const [statusTarget, setStatusTarget] = useState({
    accountId: '',
    status: 'LOCKED',
    reason: 'Tạm khóa tài khoản theo quy trình kiểm soát nội bộ',
    isSubmitting: false,
    result: null,
    error: null,
  })

  const [profileForm, setProfileForm] = useState({
    fullName: principal?.fullName || '',
    phone: '',
    email: '',
    qualification: '',
  })
  const [profileState, setProfileState] = useState({
    isSaving: false,
    error: null,
    successMessage: null,
  })

  const visibleModules = principal
    ? filterNavigationForPrincipal(STAFF_NAV_ITEMS, principal).filter(
        (item) => item.path !== '/staff'
      )
    : []

  const runDepartmentScopeCheck = async () => {
    setScopeCheck((prev) => ({ ...prev, status: 'loading', result: null, error: null }))
    try {
      const res = await authApi.checkDepartmentHeadScope(scopeCheck.departmentId)
      setScopeCheck((prev) => ({ ...prev, status: 'success', result: res, error: null }))
    } catch (err) {
      setScopeCheck((prev) => ({ ...prev, status: 'error', result: null, error: err }))
    }
  }

  const runDoctorScopeCheck = async () => {
    setScopeCheck((prev) => ({ ...prev, status: 'loading', result: null, error: null }))
    try {
      const res = await authApi.checkAssignedDoctorScope(scopeCheck.doctorStaffId)
      setScopeCheck((prev) => ({ ...prev, status: 'success', result: res, error: null }))
    } catch (err) {
      setScopeCheck((prev) => ({ ...prev, status: 'error', result: null, error: err }))
    }
  }

  const toggleProvisionRole = (roleCode) => {
    setProvisionForm((prev) => {
      const exists = prev.selectedRoles.includes(roleCode)
      const next = exists
        ? prev.selectedRoles.filter((r) => r !== roleCode)
        : [...prev.selectedRoles, roleCode]
      return { ...prev, selectedRoles: next }
    })
  }

  const handleProvisionStaff = async (event) => {
    event.preventDefault()
    if (provisionForm.selectedRoles.length === 0) {
      setProvisionState({
        isSubmitting: false,
        created: null,
        error: {
          title: 'Chưa chọn vai trò nghiệp vụ',
          detail: 'Vui lòng chọn ít nhất một vai trò cho tài khoản nhân viên mới.',
        },
      })
      return
    }

    setProvisionState({ isSubmitting: true, created: null, error: null })
    try {
      const payload = {
        loginName: provisionForm.loginName.trim(),
        password: provisionForm.password,
        staffCode: provisionForm.staffCode.trim() || null,
        fullName: provisionForm.fullName.trim(),
        email: provisionForm.email.trim() || null,
        phone: provisionForm.phone.trim() || null,
        qualification: provisionForm.qualification.trim() || null,
        professionalLicense: provisionForm.professionalLicense.trim() || null,
        primaryDepartmentId: provisionForm.primaryDepartmentId
          ? Number(provisionForm.primaryDepartmentId)
          : null,
        roles: provisionForm.selectedRoles,
      }
      const created = await authApi.provisionStaffAccount(payload)
      setProvisionState({ isSubmitting: false, created, error: null })
      setManagedAccounts((prev) => [
        created,
        ...prev.filter((item) => item.accountId !== created.accountId),
      ])
      setStatusTarget((prev) => ({
        ...prev,
        accountId: String(created.accountId),
      }))
    } catch (err) {
      setProvisionState({ isSubmitting: false, created: null, error: err })
    }
  }

  const handleStatusUpdate = async (event) => {
    event.preventDefault()
    setStatusTarget((prev) => ({ ...prev, isSubmitting: true, result: null, error: null }))
    try {
      const updated = await authApi.updateAccountStatus(statusTarget.accountId, {
        status: statusTarget.status,
        reason: statusTarget.reason,
      })
      setStatusTarget((prev) => ({ ...prev, isSubmitting: false, result: updated, error: null }))
      setManagedAccounts((prev) => [
        updated,
        ...prev.filter((item) => item.accountId !== updated.accountId),
      ])
    } catch (err) {
      setStatusTarget((prev) => ({ ...prev, isSubmitting: false, result: null, error: err }))
    }
  }

  const handleSaveStaffProfile = async (event) => {
    event.preventDefault()
    setProfileState({ isSaving: true, error: null, successMessage: null })
    try {
      const updated = await updateProfile({
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim() || null,
        email: profileForm.email.trim() || null,
        qualification: profileForm.qualification.trim() || null,
      })
      setProfileState({
        isSaving: false,
        error: null,
        successMessage: `Đã lưu cập nhật thông tin nhân viên ${updated.fullName} (${updated.profileCode}).`,
      })
    } catch (err) {
      setProfileState({ isSaving: false, error: err, successMessage: null })
    }
  }

  // Clinical / Operational Module Views
  if (CLINICAL_MODULE_CONFIG[section]) {
    const config = CLINICAL_MODULE_CONFIG[section]
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
          actions={
            <Badge tone="staff" dot>
              Phạm vi: {principal?.primaryDepartmentId ? `Khoa #${principal.primaryDepartmentId}` : 'Toàn cơ sở'}
            </Badge>
          }
        />

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Danh sách điều phối trong ca</h3>
              <p className="text-xs text-slate-500">
                Dữ liệu được đồng bộ trực tiếp theo phân quyền của nhân viên đang đăng nhập
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="search"
                  aria-label="Tìm kiếm theo mã hoặc tên bệnh nhân"
                  placeholder="Tìm mã hồ sơ, tên người bệnh..."
                  className="w-60 rounded-xl border border-slate-300 bg-slate-50/70 py-1.5 pr-3 pl-8 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-hidden"
                />
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                  <AppIcon name="search" className="text-xs" />
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={config.columns}
              rows={[]}
              emptyIcon={config.emptyIcon}
              emptyTitle={config.emptyTitle}
              emptyDescription={config.emptyDescription}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // System Admin View (/staff/admin)
  if (section === 'admin') {
    const accountColumns = [
      {
        key: 'profileCode',
        header: 'Mã nhân viên',
        render: (row) => (
          <span className="font-mono font-bold text-teal-800">{row.profileCode}</span>
        ),
      },
      {
        key: 'fullName',
        header: 'Họ và tên',
        render: (row) => <span className="font-semibold text-slate-900">{row.fullName}</span>,
      },
      {
        key: 'loginName',
        header: 'Tài khoản',
        render: (row) => <span className="font-mono text-slate-700">{row.loginName}</span>,
      },
      {
        key: 'roles',
        header: 'Vai trò đảm nhiệm',
        render: (row) => (
          <div className="flex flex-wrap gap-1">
            {(row.roles || []).map((role) => (
              <Badge key={role} tone="staff">
                {formatRoleLabel(role)}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Trạng thái',
        render: (row) => (
          <Badge tone={row.status === 'ACTIVE' ? 'success' : 'danger'} dot>
            {row.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
          </Badge>
        ),
      },
      {
        key: 'accountId',
        header: 'Mã định danh',
        align: 'right',
        render: (row) => <span className="font-mono text-xs text-slate-500">#{row.accountId}</span>,
      },
    ]

    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Quản trị hệ thống"
          title="Quản lý Tài khoản Nhân sự &amp; Phân quyền"
          description="Cấp phát tài khoản mới cho đội ngũ y bác sĩ, nhân viên cận lâm sàng, thu ngân và kiểm soát trạng thái hoạt động tức thì."
        />

        <Card>
          <CardHeader>
            <h3 className="text-base font-bold text-slate-900">
              Tài khoản nhân sự vừa cấp phát hoặc cập nhật trong phiên
            </h3>
            <p className="text-xs text-slate-500">
              Danh sách các tài khoản nhân viên vừa được thao tác trong phiên làm việc hiện tại
            </p>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={accountColumns}
              rows={managedAccounts}
              rowKey="accountId"
              emptyIcon="user-shield"
              emptyTitle="Chưa có tài khoản mới nào được cấp phát trong phiên này"
              emptyDescription="Sử dụng biểu mẫu Cấp phát tài khoản nhân viên bên dưới để khởi tạo hồ sơ và phân quyền cho nhân sự mới."
            />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-7">
            <CardHeader>
              <h3 className="text-base font-bold text-slate-900">
                Cấp phát tài khoản Nhân viên y tế mới
              </h3>
              <p className="text-xs text-slate-500">
                Khởi tạo đồng thời hồ sơ nhân sự và gán vai trò nghiệp vụ tại phòng khám
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {provisionState.error && (
                <ProblemAlert
                  error={provisionState.error}
                  onDismiss={() => setProvisionState((prev) => ({ ...prev, error: null }))}
                />
              )}

              {provisionState.created && (
                <div
                  role="status"
                  className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-950"
                >
                  <div className="flex items-center gap-2">
                    <AppIcon name="circle-check" className="text-emerald-700" />
                    <span>
                      Đã cấp phát thành công tài khoản nhân viên{' '}
                      <strong>{provisionState.created.fullName}</strong> (Mã NV:{' '}
                      <strong className="font-mono">{provisionState.created.profileCode}</strong>,
                      ID: #{provisionState.created.accountId}).
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleProvisionStaff} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    id="prov-fullName"
                    label="Họ và tên nhân viên"
                    required
                    placeholder="BS. Nguyễn Minh"
                    value={provisionForm.fullName}
                    onChange={(e) =>
                      setProvisionForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                  />
                  <InputField
                    id="prov-staffCode"
                    label="Mã nhân viên (tùy chọn)"
                    placeholder="Tự động cấp nếu để trống"
                    value={provisionForm.staffCode}
                    onChange={(e) =>
                      setProvisionForm((prev) => ({ ...prev, staffCode: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    id="prov-loginName"
                    label="Tên đăng nhập"
                    required
                    placeholder="bs.nguyenminh"
                    value={provisionForm.loginName}
                    onChange={(e) =>
                      setProvisionForm((prev) => ({ ...prev, loginName: e.target.value }))
                    }
                  />
                  <InputField
                    id="prov-password"
                    type="password"
                    label="Mật khẩu khởi tạo"
                    required
                    placeholder="Tối thiểu 8 ký tự"
                    value={provisionForm.password}
                    onChange={(e) =>
                      setProvisionForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    id="prov-phone"
                    label="Số điện thoại"
                    type="tel"
                    placeholder="0901234567"
                    value={provisionForm.phone}
                    onChange={(e) =>
                      setProvisionForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                  <InputField
                    id="prov-email"
                    label="Email công việc"
                    type="email"
                    placeholder="nguyenminh@suncare.vn"
                    value={provisionForm.email}
                    onChange={(e) =>
                      setProvisionForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <InputField
                    id="prov-qualification"
                    label="Học vị / Chuyên môn"
                    placeholder="BSCKI Nội tổng quát"
                    value={provisionForm.qualification}
                    onChange={(e) =>
                      setProvisionForm((prev) => ({ ...prev, qualification: e.target.value }))
                    }
                  />
                  <InputField
                    id="prov-license"
                    label="Số chứng chỉ hành nghề"
                    placeholder="CCHN-00123"
                    value={provisionForm.professionalLicense}
                    onChange={(e) =>
                      setProvisionForm((prev) => ({
                        ...prev,
                        professionalLicense: e.target.value,
                      }))
                    }
                  />
                  <InputField
                    id="prov-deptId"
                    label="Mã khoa công tác chính"
                    placeholder="Để trống nếu chưa gán"
                    value={provisionForm.primaryDepartmentId}
                    onChange={(e) =>
                      setProvisionForm((prev) => ({
                        ...prev,
                        primaryDepartmentId: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <p className="text-sm font-medium text-slate-700">
                    Vai trò nghiệp vụ được cấp <span className="text-red-600">*</span>
                  </p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {STAFF_ROLES_OPTIONS.map((roleCode) => {
                      const checked = provisionForm.selectedRoles.includes(roleCode)
                      return (
                        <label
                          key={roleCode}
                          className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-xs transition-colors ${
                            checked
                              ? 'border-teal-600 bg-teal-50/60 text-slate-900'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 accent-teal-700"
                            checked={checked}
                            onChange={() => toggleProvisionRole(roleCode)}
                          />
                          <div>
                            <span className="block font-semibold text-slate-900">
                              {formatRoleLabel(roleCode)}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {ROLE_METADATA[roleCode]?.description?.slice(0, 68)}...
                            </span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="staff" isLoading={provisionState.isSubmitting}>
                    <AppIcon name="user-plus" className="text-xs" />
                    <span>Cấp phát tài khoản nhân viên</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-5 h-fit">
            <CardHeader>
              <h3 className="text-base font-bold text-slate-900">
                Kiểm soát trạng thái tài khoản
              </h3>
              <p className="text-xs text-slate-500">
                Khóa hoặc kích hoạt lại quyền truy cập tài khoản tức thì
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusTarget.error && (
                <ProblemAlert
                  error={statusTarget.error}
                  onDismiss={() => setStatusTarget((prev) => ({ ...prev, error: null }))}
                />
              )}

              {statusTarget.result && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-950"
                >
                  Đã cập nhật trạng thái tài khoản{' '}
                  <strong className="font-mono">{statusTarget.result.loginName}</strong> sang{' '}
                  <strong>
                    {statusTarget.result.status === 'ACTIVE'
                      ? 'Đang hoạt động'
                      : 'Tạm khóa truy cập'}
                  </strong>
                  .
                </div>
              )}

              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <InputField
                  id="status-accountId"
                  label="Mã định danh tài khoản (ID)"
                  required
                  placeholder="Nhập mã số tài khoản"
                  value={statusTarget.accountId}
                  onChange={(e) =>
                    setStatusTarget((prev) => ({ ...prev, accountId: e.target.value }))
                  }
                />
                <InputField
                  id="status-value"
                  as="select"
                  label="Trạng thái áp dụng"
                  options={[
                    { value: 'LOCKED', label: 'Tạm khóa tài khoản' },
                    { value: 'ACTIVE', label: 'Kích hoạt hoạt động' },
                  ]}
                  value={statusTarget.status}
                  onChange={(e) =>
                    setStatusTarget((prev) => ({ ...prev, status: e.target.value }))
                  }
                />
                <InputField
                  id="status-reason"
                  as="textarea"
                  rows={3}
                  label="Lý do cập nhật"
                  value={statusTarget.reason}
                  onChange={(e) =>
                    setStatusTarget((prev) => ({ ...prev, reason: e.target.value }))
                  }
                />
                <Button
                  type="submit"
                  variant={statusTarget.status === 'LOCKED' ? 'danger' : 'staff'}
                  isLoading={statusTarget.isSubmitting}
                  className="w-full"
                >
                  <AppIcon name="lock" className="text-xs" />
                  <span>Áp dụng trạng thái</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Staff Profile View (/staff/profile)
  if (section === 'profile') {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Hồ sơ cá nhân"
          title="Thông tin Nhân viên y tế"
          description="Quản lý thông tin liên hệ công việc và học vị chuyên môn của bạn."
        />

        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-4 h-fit">
            <CardHeader>
              <h3 className="text-base font-bold text-slate-900">Thông tin công tác</h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Mã nhân viên</p>
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
                  <p className="text-xs text-slate-500">Vai trò được phân công</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(principal?.roles || []).map((role) => (
                      <Badge key={role} tone="staff">
                        {formatRoleLabel(role)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-8">
            <CardHeader>
              <h3 className="text-base font-bold text-slate-900">Cập nhật hồ sơ nhân viên</h3>
            </CardHeader>
            <CardContent className="space-y-5">
              {profileState.error && <ProblemAlert error={profileState.error} />}
              {profileState.successMessage && (
                <div
                  role="status"
                  className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900"
                >
                  <AppIcon name="circle-check" className="text-emerald-700" />
                  <span>{profileState.successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveStaffProfile} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    id="staff-prof-fullName"
                    label="Họ và tên nhân viên"
                    required
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                  />
                  <InputField
                    id="staff-prof-qualification"
                    label="Chuyên môn / Học vị"
                    placeholder="Ví dụ: BSCKI Nội tổng quát"
                    value={profileForm.qualification}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, qualification: e.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    id="staff-prof-phone"
                    label="Số điện thoại liên hệ"
                    type="tel"
                    placeholder="0901234567"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                  <InputField
                    id="staff-prof-email"
                    label="Email công việc"
                    type="email"
                    placeholder="nhanvien@suncare.vn"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="staff" isLoading={profileState.isSaving}>
                    <AppIcon name="check" className="text-xs" />
                    <span>Lưu thông tin nhân viên</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Default: Staff Overview (/staff)
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Không gian làm việc nội bộ"
        title={`Xin chào, ${principal?.fullName}`}
        description="Truy cập các phân hệ nghiệp vụ được phân quyền theo vai trò chuyên môn và phạm vi khoa công tác của bạn."
        actions={
          isSystemAdmin ? (
            <RouteLink
              to="/staff/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <AppIcon name="user-shield" className="text-xs" />
              <span>Quản trị nhân sự &amp; Quyền</span>
            </RouteLink>
          ) : null
        }
      />

      {/* Active Roles Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(principal?.roles || []).map((roleCode) => {
          const meta = ROLE_METADATA[roleCode]
          return (
            <Card key={roleCode}>
              <CardContent className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge tone="staff" dot>
                    Vai trò đang kích hoạt
                  </Badge>
                  <span className="font-mono text-xs text-slate-400">{principal?.profileCode}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {meta?.label || roleCode}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">{meta?.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Authorized Modules Grid */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Phân hệ làm việc được cấp quyền</h3>
          <p className="text-xs text-slate-500">
            Chọn phân hệ bên dưới để bắt đầu xử lý nghiệp vụ trong ca trực
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleModules.map((item) => (
            <RouteLink
              key={item.path}
              to={item.path}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:border-teal-300 hover:shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-700 group-hover:text-white">
                  <AppIcon name={item.icon} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-800">
                  {item.label}
                </h4>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                <span>Mở phân hệ</span>
                <AppIcon name="arrow-right" className="text-[10px]" />
              </div>
            </RouteLink>
          ))}
        </div>
      </section>

      {/* Clinical Assignment Scope Verification */}
      <Card>
        <CardHeader>
          <h3 className="text-base font-bold text-slate-900">
            Kiểm tra phạm vi phân công chuyên môn
          </h3>
          <p className="text-xs text-slate-500">
            Tra cứu nhanh quyền điều phối lịch theo khoa hoặc quyền xử lý lượt khám của bác sĩ phụ
            trách
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-800">
                Phạm vi công bố lịch trực chuyên khoa (Trưởng khoa)
              </p>
              <div className="flex flex-wrap items-end gap-2.5">
                <InputField
                  id="scope-dept-id"
                  label="Mã chuyên khoa"
                  value={scopeCheck.departmentId}
                  onChange={(e) =>
                    setScopeCheck((prev) => ({ ...prev, departmentId: e.target.value }))
                  }
                  className="w-44"
                />
                <Button variant="outline" size="md" onClick={runDepartmentScopeCheck}>
                  Kiểm tra phạm vi khoa
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-800">
                Phạm vi tiếp nhận lượt khám (Bác sĩ phụ trách)
              </p>
              <div className="flex flex-wrap items-end gap-2.5">
                <InputField
                  id="scope-doc-id"
                  label="Mã nhân sự bác sĩ"
                  value={scopeCheck.doctorStaffId}
                  onChange={(e) =>
                    setScopeCheck((prev) => ({ ...prev, doctorStaffId: e.target.value }))
                  }
                  className="w-44"
                />
                <Button variant="outline" size="md" onClick={runDoctorScopeCheck}>
                  Kiểm tra phạm vi bác sĩ
                </Button>
              </div>
            </div>
          </div>

          {scopeCheck.status === 'error' && <ProblemAlert error={scopeCheck.error} />}
          {scopeCheck.status === 'success' && scopeCheck.result && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-950"
            >
              <div className="flex items-center gap-2">
                <AppIcon name="circle-check" className="text-emerald-700" />
                <span>
                  Xác nhận hợp lệ: Tài khoản của bạn được phép thực hiện nghiệp vụ trong phạm vi đã
                  kiểm tra.
                </span>
              </div>
              <Badge tone="success">Được phép</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
