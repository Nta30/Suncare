import { RouteLink } from '@/app/router'
import { AppIcon } from '@/components/ui/AppIcon'
import { Badge } from '@/components/ui/Badge'
import { resolveDefaultHomeForPrincipal } from '@/features/auth/authEvaluation'
import { useAuth } from '@/features/auth/useAuth'

const SERVICE_FEATURES = [
  {
    icon: 'hospital',
    title: 'Khám chuyên khoa tại cơ sở',
    description:
      'Đăng ký nhanh theo chuyên khoa, ngày khám và buổi Sáng hoặc Chiều. Hệ thống tự động điều phối bác sĩ theo năng lực tiếp nhận thực tế tại phòng khám.',
  },
  {
    icon: 'video',
    title: 'Tư vấn khám trực tuyến',
    description:
      'Chủ động lựa chọn khung giờ khám 20 phút phù hợp. Lịch hẹn được giữ chỗ trong 5 phút và xác nhận ngay sau khi hoàn tất thanh toán qua ví MoMo.',
  },
  {
    icon: 'flask',
    title: 'Theo dõi cận lâm sàng đồng bộ',
    description:
      'Cập nhật rõ ràng trạng thái chỉ định xét nghiệm, siêu âm, chẩn đoán hình ảnh và xem kết quả chính thức ngay khi được bác sĩ phụ trách công bố.',
  },
  {
    icon: 'file-medical',
    title: 'Hồ sơ sức khỏe cá nhân bảo mật',
    description:
      'Lưu trữ xuyên suốt lịch sử lượt khám, chẩn đoán và đơn thuốc ngoại trú. Chỉ người bệnh và bác sĩ được phân công mới có quyền truy cập hồ sơ.',
  },
]

const ACCESS_STEPS = [
  {
    step: '01',
    title: 'Đăng ký hồ sơ bệnh nhân',
    description:
      'Tạo tài khoản cá nhân với thông tin hành chính chính xác để sử dụng thống nhất cho cả khám trực tiếp và khám từ xa.',
  },
  {
    step: '02',
    title: 'Chọn hình thức & thời gian khám',
    description:
      'Chọn chuyên khoa và buổi khám khi đến trực tiếp phòng khám, hoặc chọn khung giờ 20 phút khi đăng ký tư vấn trực tuyến.',
  },
  {
    step: '03',
    title: 'Khám bệnh & nhận kết quả',
    description:
      'Thực hiện khám, theo dõi chỉ định cận lâm sàng và tra cứu kết quả, đơn thuốc đã phát hành ngay trên cổng thông tin cá nhân.',
  },
]

export function HomePage() {
  const { status, principal } = useAuth()
  const isAuthenticated = status === 'authenticated' && principal

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-teal-50/40 to-slate-50 px-6 py-10 shadow-2xs sm:px-10 sm:py-14 lg:px-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 lg:col-span-7">
            <Badge tone="patient" dot>
              Phòng khám Đa khoa Ngoại trú Suncare
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.18]">
              Chăm sóc sức khỏe ngoại trú chủ động, minh bạch và tận tâm
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-slate-600">
              Đặt lịch khám chuyên khoa tại phòng khám hoặc tư vấn y tế trực tuyến từ xa, theo dõi
              tiến trình cận lâm sàng và quản lý hồ sơ sức khỏe điện tử của bạn trên một nền tảng
              duy nhất.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              {isAuthenticated ? (
                <RouteLink
                  to={resolveDefaultHomeForPrincipal(principal)}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-teal-800"
                >
                  <span>
                    {principal.accountType === 'PATIENT'
                      ? 'Vào Cổng thông tin Bệnh nhân'
                      : 'Mở Bàn làm việc Nhân viên'}
                  </span>
                  <AppIcon name="arrow-right" className="text-xs" />
                </RouteLink>
              ) : (
                <>
                  <RouteLink
                    to="/register"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-teal-800"
                  >
                    <AppIcon name="calendar-check" />
                    <span>Đặt lịch khám ngay</span>
                  </RouteLink>
                  <RouteLink
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <AppIcon name="login" />
                    <span>Đăng nhập tài khoản</span>
                  </RouteLink>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                    Hình thức tiếp nhận
                  </p>
                  <h2 className="mt-0.5 text-base font-bold text-slate-900">
                    Lựa chọn phương thức khám phù hợp
                  </h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <AppIcon name="stethoscope" />
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <AppIcon name="hospital" className="text-teal-700" />
                    <span>Khám trực tiếp tại cơ sở</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Chọn chuyên khoa, ngày khám và buổi Sáng hoặc Chiều. Bác sĩ được hệ thống phân
                    công công bằng theo số lượng tiếp nhận thực tế của ca trực.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <AppIcon name="video" className="text-teal-700" />
                    <span>Tư vấn &amp; khám trực tuyến</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Chọn khung giờ 20 phút, giữ chỗ tạm thời trong 5 phút và xác nhận lịch hẹn sau
                    khi thanh toán MoMo. Hỗ trợ hủy lịch trước giờ hẹn ít nhất 24 giờ.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-teal-50/80 px-4 py-3 text-xs text-teal-900">
                <span className="font-medium">Bạn mới đến khám lần đầu tại Suncare?</span>
                <RouteLink
                  to="/register"
                  className="font-semibold text-teal-800 underline hover:text-teal-950"
                >
                  Tạo hồ sơ ngay →
                </RouteLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="dich-vu" className="space-y-8 scroll-mt-24">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Dịch vụ y tế ngoại trú
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Trải nghiệm khám chữa bệnh rõ ràng, thuận tiện cho người bệnh
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Mỗi bước từ khi đăng ký lịch hẹn, thực hiện cận lâm sàng đến khi nhận kết quả và đơn
            thuốc đều được chuẩn hóa minh bạch.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-shadow hover:shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                  <AppIcon name={feature.icon} className="text-base" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* How to access services */}
      <section
        id="huong-dan"
        className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-10 scroll-mt-24"
      >
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Hướng dẫn tiếp cận dịch vụ
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Ba bước đơn giản để đặt lịch và theo dõi hồ sơ khám bệnh
          </h2>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {ACCESS_STEPS.map((item) => (
            <div
              key={item.step}
              className="relative rounded-2xl border border-slate-100 bg-slate-50/70 p-6 space-y-3"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-xs font-bold text-white">
                {item.step}
              </span>
              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs leading-relaxed text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Discreet Staff Entry & Patient CTA */}
      <section className="rounded-2xl border border-slate-200/80 bg-slate-900 px-6 py-8 text-white sm:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">
              Hệ thống thông tin Phòng khám Suncare
            </p>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Sẵn sàng đặt lịch khám hoặc tra cứu hồ sơ y tế của bạn?
            </h2>
            <p className="text-xs text-slate-300">
              Bệnh nhân và nhân viên y tế sử dụng cổng đăng nhập tập trung để truy cập đúng không
              gian làm việc được phân quyền.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <RouteLink
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500"
            >
              <span>Đăng ký Bệnh nhân</span>
            </RouteLink>
            <RouteLink
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-700"
            >
              <AppIcon name="user-doctor" className="text-xs text-teal-300" />
              <span>Đăng nhập (Bệnh nhân / Nhân viên)</span>
            </RouteLink>
          </div>
        </div>
      </section>
    </div>
  )
}
