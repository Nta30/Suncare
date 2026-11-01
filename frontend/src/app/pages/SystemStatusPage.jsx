import { useCallback, useEffect, useState } from 'react'
import { apiClient, ApiError } from '@/lib/apiClient'
import { formatSaigonDateTime, formatVnd } from '@/lib/formatters'

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
              code: 'UNEXPECTED_CLIENT_ERROR',
              title: 'Lỗi kiểm tra trạng thái',
              detail: err instanceof Error ? err.message : 'Không thể kiểm tra kết nối',
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
                code: 'UNEXPECTED_CLIENT_ERROR',
                title: 'Lỗi kiểm tra trạng thái',
                detail: err instanceof Error ? err.message : 'Không thể kiểm tra kết nối',
              })
        setState({ status: 'error', data: null, error: normalizedError })
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Trạng thái kết nối API (`GET /api/v1/health`)
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Kiểm tra trực tiếp phản hồi từ máy chủ Spring Boot (không chứa dữ liệu bệnh nhân).
            </p>
          </div>
          <button
            type="button"
            onClick={checkHealth}
            disabled={state.status === 'loading'}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {state.status === 'loading' ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
          </button>
        </div>

        <div className="mt-6" aria-live="polite">
          {state.status === 'loading' && (
            <div
              role="status"
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
            >
              Đang kết nối tới <code>{apiClient.baseUrl}/health</code>...
            </div>
          )}

          {state.status === 'empty' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Máy chủ trả về phản hồi rỗng.
            </div>
          )}

          {state.status === 'error' && state.error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 space-y-1"
            >
              <p className="font-semibold">
                {state.error.title} ({state.error.code})
              </p>
              <p>{state.error.detail}</p>
              {state.error.correlationId && (
                <p className="text-xs text-red-700">
                  Mã tương quan (Correlation ID): <code>{state.error.correlationId}</code>
                </p>
              )}
            </div>
          )}

          {state.status === 'success' && state.data && (
            <dl className="grid gap-4 sm:grid-cols-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase text-emerald-800">Trạng thái</dt>
                <dd className="mt-1 font-bold text-emerald-950">{state.data.status}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-emerald-800">Dịch vụ</dt>
                <dd className="mt-1 font-mono text-emerald-950">{state.data.service}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-emerald-800">Múi giờ</dt>
                <dd className="mt-1 text-emerald-950">
                  Lưu trữ: {state.data.storageTimezone} / Hiển thị: {state.data.displayTimezone}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-emerald-800">
                  Thời điểm phản hồi (Asia/Saigon)
                </dt>
                <dd className="mt-1 text-emerald-950">
                  {formatSaigonDateTime(state.data.timestamp)}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-base font-semibold text-slate-900">
          Chuẩn định dạng tiền tệ &amp; thời gian phía Client (DEMO kiểm chứng định dạng)
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Số tiền VND truyền từ API dưới dạng chuỗi số nguyên được giữ nguyên độ chính xác: ví dụ{' '}
          <code>&quot;150000&quot;</code> → <strong>{formatVnd('150000')}</strong>.
        </p>
      </section>
    </div>
  )
}

