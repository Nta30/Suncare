import { EmptyState } from '@/components/common/EmptyState'
import { ProblemAlert } from '@/components/common/ProblemAlert'
import { Button } from '@/components/ui/Button'

export function AsyncStateView({
  status,
  loadingText = 'Đang tải dữ liệu...',
  emptyTitle = 'Chưa có dữ liệu',
  emptyDescription = 'Hiện chưa có thông tin hiển thị trong mục này.',
  error = null,
  onRetry = null,
  children,
}) {
  if (status === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-2xs"
      >
        <span
          aria-hidden="true"
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-teal-700 border-t-transparent"
        />
        <span className="font-medium">{loadingText}</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="space-y-3">
        <ProblemAlert error={error} />
        {onRetry && (
          <div>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Thử lại
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (status === 'empty') {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return children || null
}
