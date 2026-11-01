import { RouteLink } from '@/app/router'

export function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-sky-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
      >
        Chuyển đến nội dung chính
      </a>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Cơ sở khám ngoại trú Suncare
            </p>
            <h1 className="text-lg font-bold text-slate-900">
              Hệ thống đặt lịch, khám ngoại trú &amp; cận lâm sàng
            </h1>
          </div>

          <nav aria-label="Điều hướng chính" className="flex items-center gap-2">
            <RouteLink
              to="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 aria-[current=page]:bg-teal-50 aria-[current=page]:text-teal-800"
            >
              Tổng quan nền tảng
            </RouteLink>
            <RouteLink
              to="/system-status"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 aria-[current=page]:bg-teal-50 aria-[current=page]:text-teal-800"
            >
              Trạng thái kết nối API
            </RouteLink>
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-600">
        <div className="mx-auto max-w-6xl px-4 flex flex-wrap justify-between gap-2">
          <span>Múi giờ hiển thị: Asia/Saigon (GMT+7) • Lưu trữ máy chủ: UTC</span>
          <span>Chứng từ thu dịch vụ nội bộ (không phải hóa đơn thuế)</span>
        </div>
      </footer>
    </div>
  )
}

