import { useState } from 'react'
import { RouteLink } from '@/app/router'
import { useRouter } from '@/app/routerContext'
import { AppIcon } from '@/components/ui/AppIcon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PATIENT_NAV_ITEMS } from '@/features/auth/authConstants'
import { filterNavigationForPrincipal } from '@/features/auth/authEvaluation'
import { useAuth } from '@/features/auth/useAuth'

export function PatientLayout({ children }) {
  const { principal, logout, refreshSession } = useAuth()
  const { navigate } = useRouter()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const visibleNavItems = principal
    ? filterNavigationForPrincipal(PATIENT_NAV_ITEMS, principal)
    : PATIENT_NAV_ITEMS

  const handleSignOut = async () => {
    await logout('Bạn đã đăng xuất khỏi Cổng thông tin Bệnh nhân.')
    navigate('/login')
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshSession()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3.5">
            <RouteLink to="/patient" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-2xs transition-colors group-hover:bg-teal-800">
                <AppIcon name="heart-pulse" className="text-lg" />
              </div>
              <div>
                <span className="block text-base font-bold tracking-tight text-slate-900">
                  Suncare
                </span>
                <span className="block text-xs font-medium text-teal-700">
                  Cổng thông tin Bệnh nhân
                </span>
              </div>
            </RouteLink>

            {principal && (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-xs font-bold text-teal-800">
                    <AppIcon name="user" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900">{principal.fullName}</p>
                    <p className="text-[11px] text-slate-500">
                      Mã BN: <span className="font-mono font-semibold text-teal-800">{principal.profileCode}</span>
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  isLoading={isRefreshing}
                  onClick={handleRefresh}
                  title="Cập nhật lại thông tin phiên làm việc"
                >
                  <AppIcon name="refresh" />
                  <span className="hidden lg:inline">Làm mới</span>
                </Button>

                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <AppIcon name="logout" />
                  <span>Đăng xuất</span>
                </Button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-expanded={mobileNavOpen}
              aria-label="Mở menu Cổng bệnh nhân"
              className="inline-flex md:hidden items-center justify-center rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-100"
            >
              <AppIcon name={mobileNavOpen ? 'close' : 'bars'} />
            </button>
          </div>

          <nav
            aria-label="Điều hướng Cổng bệnh nhân"
            className="hidden md:flex items-center gap-1 border-t border-slate-100 py-2"
          >
            {visibleNavItems.map((item) => (
              <RouteLink
                key={item.path}
                to={item.path}
                className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 aria-[current=page]:bg-teal-50 aria-[current=page]:font-semibold aria-[current=page]:text-teal-800"
              >
                <AppIcon name={item.icon} className="text-xs opacity-80" />
                <span>{item.label}</span>
              </RouteLink>
            ))}
          </nav>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden space-y-4">
            {principal && (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{principal.fullName}</p>
                  <p className="text-xs text-slate-500">
                    Mã BN: <span className="font-mono font-semibold text-teal-800">{principal.profileCode}</span>
                  </p>
                </div>
                <Badge tone="patient" dot>
                  Bệnh nhân
                </Badge>
              </div>
            )}

            <nav aria-label="Điều hướng Cổng bệnh nhân di động" className="flex flex-col gap-1">
              {visibleNavItems.map((item) => (
                <RouteLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileNavOpen(false)}
                  className="inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 aria-[current=page]:bg-teal-50 aria-[current=page]:font-semibold aria-[current=page]:text-teal-800"
                >
                  <AppIcon name={item.icon} className="text-xs" />
                  <span>{item.label}</span>
                </RouteLink>
              ))}
            </nav>

            {principal && (
              <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isRefreshing}
                  onClick={handleRefresh}
                  className="flex-1"
                >
                  <AppIcon name="refresh" />
                  <span>Làm mới</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={handleSignOut} className="flex-1">
                  <AppIcon name="logout" />
                  <span>Đăng xuất</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8"
      >
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <span>
            Phòng khám Đa khoa Ngoại trú Suncare • Cổng dịch vụ trực tuyến dành cho người bệnh
          </span>
          <span>Múi giờ hiển thị: Việt Nam (GMT+7) • Chứng từ thu phí dịch vụ nội bộ</span>
        </div>
      </footer>
    </div>
  )
}
