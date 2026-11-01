import { AppIcon } from '@/components/ui/AppIcon'

export function EmptyState({
  icon = 'notes-medical',
  title = 'Chưa có dữ liệu',
  description = 'Hiện chưa có bản ghi nào trong mục này.',
  action = null,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center ${className}`.trim()}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
        <AppIcon name={icon} className="text-lg" />
      </div>
      <h4 className="mt-4 text-sm font-semibold text-slate-900">{title}</h4>
      <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500">{description}</p>
      {action && <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}

