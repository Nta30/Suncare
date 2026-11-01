import { useState } from 'react'
import { RouteLink } from '@/app/router'
import { AppIcon } from '@/components/ui/AppIcon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { resolveDefaultHomeForPrincipal } from '@/features/auth/authEvaluation'
import { useAuth } from '@/features/auth/useAuth'

export function PublicLayout({ children }) {
  const { status, principal, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAuthenticated = status === 'authenticated' && principal

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <RouteLink to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-2xs transition-colors group-hover:bg-teal-800">
              <AppIcon name="heart-pulse" className="text-lg" />
            </div>
            <div>
              <span className="block text-base font-bold tracking-tight text-slate-900">
                Suncare Clinic
              </span>
              <span className="block text-xs font-medium text-slate-500">
                Phòng khám Đa khoa Ngoại trú
              </span>
            </div>
          </RouteLink>

          <nav
            aria-label="Điều hướng công khai"
            className="hidden md:flex items-center gap-1"
          >
            <RouteLink
              to="/"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 aria-[current=page]:bg-teal-50 aria-[current=page]:text-teal-800 aria-[current=page]:font-semibold"
            >
              Trang chủ
            </RouteLink>
            <a
              href="/#dich-vu"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Dịch vụ khám
            </a>
            <a
              href="/#huong-dan"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Hướng dẫn đặt lịch
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                <Badge tone="patient" dot>
                  {principal.fullName}
                </Badge>
                <RouteLink
                  to={resolveDefaultHomeForPrincipal(principal)}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-2xs hover:bg-teal-800"
                >
                  <span>
                    {principal.accountType === 'PATIENT'
                      ? 'Cổng bệnh nhân'
                      : 'Bàn làm việc'}
                  </span>
                  <AppIcon name="arrow-right" className="text-xs" />
                </RouteLink>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout('Bạn đã đăng xuất khỏi hệ thống.')}
                >
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <RouteLink
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 aria-[current=page]:border-teal-600 aria-[current=page]:text-teal-800"
                >
                  <span>Đăng nhập</span>
                </RouteLink>
                <RouteLink
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-teal-800"
                >
                  <AppIcon name="calendar-check" className="text-xs" />
                  <span>Đăng ký khám bệnh</span>
                </RouteLink>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Mở menu điều hướng"
            className="inline-flex md:hidden items-center justify-center rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-100"
          >
            <AppIcon name={mobileMenuOpen ? 'close' : 'bars'} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden space-y-3">
            <nav aria-label="Điều hướng di động" className="flex flex-col gap-1">
              <RouteLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 aria-[current=page]:bg-teal-50 aria-[current=page]:font-semibold aria-[current=page]:text-teal-800"
              >
                Trang chủ
              </RouteLink>
              <a
                href="/#dich-vu"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Dịch vụ khám
              </a>
              <a
                href="/#huong-dan"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Hướng dẫn đặt lịch
              </a>
            </nav>

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
              {isAuthenticated ? (
                <>
                  <RouteLink
                    to={resolveDefaultHomeForPrincipal(principal)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <span>
                      {principal.accountType === 'PATIENT'
                        ? 'Vào Cổng bệnh nhân'
                        : 'Vào Bàn làm việc'}
                    </span>
                    <AppIcon name="arrow-right" className="text-xs" />
                  </RouteLink>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      logout('Bạn đã đăng xuất khỏi hệ thống.')
                    }}
                  >
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <RouteLink
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <AppIcon name="calendar-check" className="text-xs" />
                    <span>Đăng ký khám bệnh</span>
                  </RouteLink>
                  <RouteLink
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    Đăng nhập
                  </RouteLink>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      >
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white text-slate-600">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
                  <AppIcon name="heart-pulse" className="text-sm" />
                </div>
                <span className="text-base font-bold text-slate-900">
                  Phòng khám Đa khoa Suncare
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                Nền tảng tiếp nhận đặt lịch khám chuyên khoa ngoại trú, tư vấn y tế trực tuyến và
                quản lý hồ sơ sức khỏe cá nhân đồng bộ tại một cơ sở duy nhất.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <p className="font-semibold uppercase tracking-wider text-slate-900">
                Dành cho người bệnh
              </p>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <RouteLink to="/register" className="hover:text-teal-700">
                    Tạo hồ sơ bệnh nhân mới
                  </RouteLink>
                </li>
                <li>
                  <RouteLink to="/login" className="hover:text-teal-700">
                    Đăng nhập tra cứu lịch hẹn &amp; kết quả
                  </RouteLink>
                </li>
                <li>
                  <a href="/#huong-dan" className="hover:text-teal-700">
                    Quy định đặt khám &amp; hủy lịch hẹn
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 text-xs">
              <p className="font-semibold uppercase tracking-wider text-slate-900">
                Thông tin vận hành
              </p>
              <p className="leading-relaxed text-slate-500">
                Thời gian hiển thị theo múi giờ Việt Nam (GMT+7). Chứng từ thu phí dịch vụ y tế
                phát hành tại phòng khám là chứng từ thu nội bộ.
              </p>
              <div className="pt-1">
                <RouteLink
                  to="/login"
                  className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-teal-700"
                >
                  <AppIcon name="user-doctor" className="text-xs" />
                  <span>Cổng đăng nhập dành cho Bác sĩ &amp; Nhân viên y tế</span>
                </RouteLink>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>© {new Date().getFullYear()} Suncare Outpatient Clinic. Bảo lưu mọi quyền.</span>
            <span>Hệ thống Quản lý Khám ngoại trú &amp; Cận lâm sàng</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
