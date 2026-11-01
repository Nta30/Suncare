import { EmptyState } from '@/components/common/EmptyState'

export function DataTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  emptyIcon = 'table-columns',
  emptyTitle = 'Chưa có dữ liệu hiển thị',
  emptyDescription = 'Các bản ghi phát sinh trong ca làm việc sẽ được cập nhật tại đây.',
  emptyAction = null,
  caption = null,
}) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="space-y-3">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            {caption && <caption className="sr-only">{caption}</caption>}
            <thead className="bg-slate-50/80">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
          <div className="p-6">
            <EmptyState
              icon={emptyIcon}
              title={emptyTitle}
              description={emptyDescription}
              action={emptyAction}
              className="border-0 bg-transparent py-6"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-50/90">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, index) => {
            const key =
              typeof rowKey === 'function' ? rowKey(row, index) : (row[rowKey] ?? index)
            return (
              <tr key={key} className="transition-colors hover:bg-slate-50/70">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`whitespace-nowrap px-4 py-3.5 text-sm text-slate-700 ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {typeof col.render === 'function' ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

