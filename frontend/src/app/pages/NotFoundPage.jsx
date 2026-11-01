import { RouteLink } from '@/app/router'
import { AppIcon } from '@/components/ui/AppIcon'

export function NotFoundPage() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-2xs space-y-4"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        <AppIcon name="circle-info" className="text-xl" />
      </div>
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Không tìm thấy trang
        </p>
        <h2 id="not-found-title" className="text-2xl font-bold text-slate-900">
          Đường dẫn không tồn tại
        </h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang địa chỉ khác.
        </p>
      </div>
      <div className="pt-2">
        <RouteLink
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <span>Quay về trang chủ</span>
          <AppIcon name="arrow-right" className="text-xs" />
        </RouteLink>
      </div>
    </section>
  )
}
