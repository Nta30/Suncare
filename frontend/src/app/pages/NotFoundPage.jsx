import { RouteLink } from '@/app/router'

export function NotFoundPage() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">HTTP 404</p>
      <h2 id="not-found-title" className="mt-2 text-2xl font-bold text-slate-900">
        Không tìm thấy đường dẫn yêu cầu
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Đường dẫn bạn truy cập không tồn tại hoặc chưa được kích hoạt trong giai đoạn hiện tại.
      </p>
      <div className="mt-6">
        <RouteLink
          to="/"
          className="inline-flex items-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Quay về trang tổng quan
        </RouteLink>
      </div>
    </section>
  )
}

