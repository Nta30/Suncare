import { PatientLayout } from '@/app/layouts/PatientLayout'
import { PublicLayout } from '@/app/layouts/PublicLayout'
import { StaffLayout } from '@/app/layouts/StaffLayout'
import { useRouter } from '@/app/routerContext'
import { AppIcon } from '@/components/ui/AppIcon'
import { useAuth } from '@/features/auth/useAuth'

export function AppShell({ children }) {
  const { path } = useRouter()
  const { sessionNotice, clearSessionNotice } = useAuth()

  const isPatientRoute = path === '/patient' || path.startsWith('/patient/')
  const isStaffRoute = path === '/staff' || path.startsWith('/staff/')

  const LayoutComponent = isPatientRoute
    ? PatientLayout
    : isStaffRoute
      ? StaffLayout
      : PublicLayout

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-teal-700 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-md"
      >
        Chuyển đến nội dung chính
      </a>

      {sessionNotice && (
        <div
          role="status"
          aria-live="polite"
          className={`border-b px-4 py-2.5 text-xs ${
            sessionNotice.tone === 'danger'
              ? 'border-red-200 bg-red-50 text-red-900'
              : sessionNotice.tone === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : sessionNotice.tone === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 bg-slate-100 text-slate-800'
          }`}
        >
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AppIcon
                name={
                  sessionNotice.tone === 'danger'
                    ? 'circle-exclamation'
                    : sessionNotice.tone === 'success'
                      ? 'circle-check'
                      : 'circle-info'
                }
              />
              <div>
                <strong className="font-semibold">{sessionNotice.title}: </strong>
                <span>{sessionNotice.message}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={clearSessionNotice}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold hover:bg-black/5"
            >
              <span>Đóng</span>
              <AppIcon name="close" />
            </button>
          </div>
        </div>
      )}

      <LayoutComponent>{children}</LayoutComponent>
    </>
  )
}
