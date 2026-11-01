import { useCallback, useEffect, useState } from 'react'
import { ProblemAlert } from '@/components/common/ProblemAlert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { apiClient, ApiError } from '@/lib/apiClient'
import { formatSaigonDateTime } from '@/lib/formatters'

export function SystemStatusPage() {
  const [state, setState] = useState({
    status: 'loading',
    data: null,
    error: null,
  })

  const checkHealth = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null })
    try {
      const payload = await apiClient.getHealth()
      if (!payload || !payload.status) {
        setState({ status: 'empty', data: null, error: null })
        return
      }
      setState({ status: 'success', data: payload, error: null })
    } catch (err) {
      const normalizedError =
        err instanceof ApiError
          ? err
          : new ApiError({
              status: 0,
              code: 'NETWORK_ERROR',
              title: 'Không thể kiểm tra kết nối',
              detail: err instanceof Error ? err.message : 'Máy chủ tạm thời không phản hồi.',
            })
      setState({ status: 'error', data: null, error: normalizedError })
    }
  }, [])

  useEffect(() => {
    let active = true
    apiClient
      .getHealth()
      .then((payload) => {
        if (!active) return
        if (!payload || !payload.status) {
          setState({ status: 'empty', data: null, error: null })
          return
        }
        setState({ status: 'success', data: payload, error: null })
      })
      .catch((err) => {
        if (!active) return
        const normalizedError =
          err instanceof ApiError
            ? err
            : new ApiError({
                status: 0,
                code: 'NETWORK_ERROR',
                title: 'Không thể kiểm tra kết nối',
                detail: err instanceof Error ? err.message : 'Máy chủ tạm thời không phản hồi.',
              })
        setState({ status: 'error', data: null, error: normalizedError })
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Hệ thống trực tuyến
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Trạng thái dịch vụ Suncare
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            isLoading={state.status === 'loading'}
            onClick={checkHealth}
          >
            Kiểm tra lại
          </Button>
        </CardHeader>

        <CardContent aria-live="polite" className="space-y-4">
          {state.status === 'loading' && (
            <p className="text-sm text-slate-600">Đang kiểm tra trạng thái kết nối dịch vụ...</p>
          )}

          {state.status === 'error' && <ProblemAlert error={state.error} />}

          {state.status === 'success' && state.data && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge tone="success" dot>
                  Hệ thống đang hoạt động bình thường
                </Badge>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Trạng thái dịch vụ</dt>
                  <dd className="mt-1 font-semibold text-slate-900">Sẵn sàng phục vụ</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Múi giờ làm việc</dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {state.data.displayTimezone || 'Asia/Saigon'} (GMT+7)
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-slate-500">Cập nhật lúc</dt>
                  <dd className="mt-1 font-medium text-slate-800">
                    {formatSaigonDateTime(state.data.timestamp)}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
