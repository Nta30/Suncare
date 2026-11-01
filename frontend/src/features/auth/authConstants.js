export const ACCOUNT_TYPES = Object.freeze({
  PATIENT: 'PATIENT',
  STAFF: 'STAFF',
})

export const ACCOUNT_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED',
  INACTIVE: 'INACTIVE',
})

export const ROLE_CODES = Object.freeze({
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  LAB_STAFF: 'LAB_STAFF',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  CASHIER: 'CASHIER',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
})

export const ROLE_METADATA = Object.freeze({
  PATIENT: {
    code: 'PATIENT',
    accountType: 'PATIENT',
    label: 'Bệnh nhân',
    defaultRoute: '/patient',
    description:
      'Đặt lịch khám ngoại trú trực tiếp hoặc trực tuyến, theo dõi kết quả cận lâm sàng và quản lý hồ sơ cá nhân.',
  },
  DOCTOR: {
    code: 'DOCTOR',
    accountType: 'STAFF',
    label: 'Bác sĩ khám bệnh',
    defaultRoute: '/staff/encounters',
    description:
      'Tiếp nhận lượt khám được phân công, ghi nhận sinh hiệu, chẩn đoán, chỉ định cận lâm sàng và kê đơn điều trị.',
  },
  LAB_STAFF: {
    code: 'LAB_STAFF',
    accountType: 'STAFF',
    label: 'Chuyên viên Cận lâm sàng',
    defaultRoute: '/staff/lab',
    description:
      'Tiếp nhận bệnh phẩm, quản lý hàng đợi xét nghiệm - chẩn đoán hình ảnh và phát hành kết quả cận lâm sàng.',
  },
  DEPARTMENT_HEAD: {
    code: 'DEPARTMENT_HEAD',
    accountType: 'STAFF',
    label: 'Trưởng khoa',
    defaultRoute: '/staff/scheduling',
    description:
      'Điều phối lịch làm việc, phân công ca trực chuyên khoa, quản lý khung giờ khám trực tuyến và theo dõi báo cáo khoa.',
  },
  CASHIER: {
    code: 'CASHIER',
    accountType: 'STAFF',
    label: 'Thu ngân',
    defaultRoute: '/staff/billing',
    description:
      'Thực hiện thu phí dịch vụ y tế, đối soát thanh toán, quản lý phiếu thu nội bộ và xử lý hoàn tiền cho người bệnh.',
  },
  SYSTEM_ADMIN: {
    code: 'SYSTEM_ADMIN',
    accountType: 'STAFF',
    label: 'Quản trị hệ thống',
    defaultRoute: '/staff/admin',
    description:
      'Quản lý tài khoản nhân sự, phân quyền nghiệp vụ, thiết lập danh mục chuyên khoa - dịch vụ và giám sát vận hành.',
  },
})

export const PATIENT_NAV_ITEMS = Object.freeze([
  {
    path: '/patient',
    label: 'Tổng quan',
    icon: 'house-medical',
    requiredAccountType: 'PATIENT',
    requiredPermissions: [],
  },
  {
    path: '/patient/booking-onsite',
    label: 'Đặt khám tại cơ sở',
    icon: 'hospital',
    requiredAccountType: 'PATIENT',
    requiredPermissions: ['APPOINTMENT_CREATE_SELF'],
  },
  {
    path: '/patient/booking-online',
    label: 'Khám trực tuyến',
    icon: 'video',
    requiredAccountType: 'PATIENT',
    requiredPermissions: ['APPOINTMENT_CREATE_SELF'],
  },
  {
    path: '/patient/records',
    label: 'Hồ sơ sức khỏe',
    icon: 'file-medical',
    requiredAccountType: 'PATIENT',
    requiredPermissions: ['EMR_READ_SELF'],
  },
  {
    path: '/patient/profile',
    label: 'Thông tin cá nhân',
    icon: 'user',
    requiredAccountType: 'PATIENT',
    requiredPermissions: ['PROFILE_EDIT_SELF'],
  },
])

export const STAFF_NAV_ITEMS = Object.freeze([
  {
    path: '/staff',
    label: 'Tổng quan công việc',
    icon: 'table-columns',
    requiredAccountType: 'STAFF',
    requiredRoles: [],
    requiredPermissions: [],
  },
  {
    path: '/staff/encounters',
    label: 'Khám bệnh & Chỉ định',
    icon: 'stethoscope',
    requiredAccountType: 'STAFF',
    requiredRoles: ['DOCTOR'],
    requiredPermissions: ['ENCOUNTER_WRITE_ASSIGNED'],
  },
  {
    path: '/staff/lab',
    label: 'Hàng đợi Cận lâm sàng',
    icon: 'flask',
    requiredAccountType: 'STAFF',
    requiredRoles: ['LAB_STAFF'],
    requiredPermissions: ['RESULT_WRITE_ASSIGNED'],
  },
  {
    path: '/staff/scheduling',
    label: 'Lịch trực & Phân công',
    icon: 'calendar-days',
    requiredAccountType: 'STAFF',
    requiredRoles: ['DEPARTMENT_HEAD', 'DOCTOR', 'LAB_STAFF'],
    requiredPermissions: ['SCHEDULE_READ_SELF'],
  },
  {
    path: '/staff/billing',
    label: 'Thu ngân & Hoàn tiền',
    icon: 'credit-card',
    requiredAccountType: 'STAFF',
    requiredRoles: ['CASHIER', 'DOCTOR'],
    requiredPermissions: [],
  },
  {
    path: '/staff/admin',
    label: 'Quản trị nhân sự & Quyền',
    icon: 'user-shield',
    requiredAccountType: 'STAFF',
    requiredRoles: ['SYSTEM_ADMIN'],
    requiredPermissions: ['ACCOUNT_MANAGE'],
  },
  {
    path: '/staff/reports',
    label: 'Báo cáo thống kê',
    icon: 'chart-line',
    requiredAccountType: 'STAFF',
    requiredRoles: ['DOCTOR', 'DEPARTMENT_HEAD', 'CASHIER', 'SYSTEM_ADMIN'],
    requiredPermissions: [],
  },
  {
    path: '/staff/profile',
    label: 'Hồ sơ nhân viên',
    icon: 'id-badge',
    requiredAccountType: 'STAFF',
    requiredRoles: [],
    requiredPermissions: ['PROFILE_EDIT_SELF'],
  },
])
