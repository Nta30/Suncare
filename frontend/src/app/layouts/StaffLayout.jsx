import { useState } from 'react'
import { RouteLink } from '@/app/router'
import { useRouter } from '@/app/routerContext'
import { AppIcon } from '@/components/ui/AppIcon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { STAFF_NAV_ITEMS } from '@/features/auth/authConstants'
import {
  filterNavigationForPrincipal,
  formatRoleLabel,
} from '@/features/auth/authEvaluation'
import { useAuth } from '@/features/auth/useAuth'

export function StaffLayout({ children }) {
  const { principal, logout, refreshSession } = useAuth()
  const { path, navigate } = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const visibleNavItems = principal
    ? filterNavigationForPrincipal(STAFF_NAV_ITEMS, principal)
    : STAFF_NAV_ITEMS

  const activeNavItem =
    visibleNavItems.find((item) => item.path === path) || visibleNavItems[0]

  const handleSignOut = async () => {
    await logout('Bạn đã đăng xuất khỏi Bàn làm việc Nhân viên.')
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
    <div className="min-h-screen flex bg-slate-100/80 text-slate-900">
      {/* Desktop Sidebar */}
      <aside
        aria-label="Điều hướng phân hệ nhân viên"
        className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col bg-slate-900 text-slate-200 border-r border-slate-800"
      >
        <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-2xs">
            <AppIcon name="heart-pulse" />
          </div>
          <div>
            <span className="block text-sm font-bold tracking-tight text-white">
              Suncare Workspace
            </span>
            <span className="block text-[11px] font-medium text-teal-300">
              Hệ thống Lâm sàng &amp; Vận hành
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Phân hệ nghiệp vụ
            </p>
            <nav className="mt-2 flex flex-col gap-1">
              {visibleNavItems.map((item) => (
                <RouteLink
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800/80 hover:text-white aria-[current=page]:bg-teal-600 aria-[current=page]:font-semibold aria-[current=page]:text-white"
                >
                  <AppIcon name={item.icon} className="w-4 text-center text-xs opacity-90" />
                  <span>{item.label}</span>
                </RouteLink>
              ))}
            </nav>
          </div>
        </div>

        {principal && (
          <div className="border-t border-slate-800 p-4 space-y-3 text-xs">
            <div className="rounded-xl bg-slate-800/90 p-3 space-y-1.5">
              <p className="font-semibold text-white">{principal.fullName}</p>
              <p className="text-slate-400">
                Mã NV: <span className="font-mono text-teal-300">{principal.profileCode}</span>
              </p>
              <p className="text-slate-400">
                Phạm vi khoa:{' '}
                <span className="font-medium text-slate-200">
                  {principal.primaryDepartmentId
                    ? `Khoa #${principal.primaryDepartmentId}`
                    : 'Toàn phòng khám'}
                </span>
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-label="Mở menu điều hướng nhân viên"
                className="inline-flex lg:hidden items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
              >
                <AppIcon name={mobileMenuOpen ? 'close' : 'bars'} />
              </button>
              <div>
                <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                  {activeNavItem?.label || 'Bàn làm việc Nhân viên'}
                </h1>
                <p className="hidden sm:block text-xs text-slate-500">
                  Phòng khám Đa khoa Ngoại trú Suncare • Múi giờ làm việc: GMT+7
                </p>
              </div>
            </div>

            {principal && (
              <div className="flex items-center gap-2.5">
                <div className="hidden md:flex flex-wrap items-center gap-1.5">
                  {(principal.roles || []).map((role) => (
                    <Badge key={role} tone="staff" dot>
                      {formatRoleLabel(role)}
                    </Badge>
                  ))}
                </div>

                <div className="hidden sm:block text-right border-l border-slate-200 pl-3">
                  <p className="text-xs font-semibold text-slate-900">{principal.fullName}</p>
                  <p className="text-[11px] font-mono text-slate-500">{principal.profileCode}</p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  isLoading={isRefreshing}
                  onClick={handleRefresh}
                  title="Đồng bộ lại trạng thái phân quyền"
                >
                  <AppIcon name="refresh" />
                  <span className="hidden xl:inline">Làm mới</span>
                </Button>

                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <AppIcon name="logout" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="border-t border-slate-200 bg-slate-900 px-4 py-4 text-slate-100 lg:hidden space-y-4">
              {principal && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-800 p-3 text-xs">
                  <div>
                    <p className="font-semibold text-white">{principal.fullName}</p>
                    <p className="text-slate-400">Mã NV: {principal.profileCode}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(principal.roles || []).map((role) => (
                      <Badge key={role} tone="patient">
                        {formatRoleLabel(role)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <nav aria-label="Điều hướng nhân viên di động" className="flex flex-col gap-1">
                {visibleNavItems.map((item) => (
                  <RouteLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white aria-[current=page]:bg-teal-600 aria-[current=page]:font-semibold aria-[current=page]:text-white"
                  >
                    <AppIcon name={item.icon} className="w-4 text-center text-xs" />
                    <span>{item.label}</span>
                  </RouteLink>
                ))}
              </nav>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main
          id="main-content"
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        >
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
            <span>Suncare Clinical &amp; Operations • Hệ thống quản lý khám chữa bệnh nội bộ</span>
            <span>
              Kết quả cận lâm sàng đã công bố được bảo toàn lịch sử phiên bản • Chứng từ thu nội bộ
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
