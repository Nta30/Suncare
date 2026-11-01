import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '@/features/auth/authApi'
import { AuthContext } from '@/features/auth/useAuth'

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('initializing')
  const [principal, setPrincipal] = useState(null)
  const [sessionNotice, setSessionNotice] = useState(null)
  const [lockedError, setLockedError] = useState(null)

  useEffect(() => {
    let active = true

    const unsubscribe = authApi.onAuthStateFailure((classification, err) => {
      if (!active) return
      setPrincipal(null)
      if (classification.isLocked) {
        setStatus('locked')
        setLockedError(err)
        setSessionNotice({
          tone: 'danger',
          title: 'Tài khoản đã bị tạm khóa',
          message: classification.userMessage,
          correlationId: err?.correlationId || null,
        })
      } else {
        setStatus('unauthenticated')
        setLockedError(null)
        setSessionNotice({
          tone: 'warning',
          title: 'Phiên đăng nhập đã kết thúc',
          message: classification.userMessage,
          correlationId: err?.correlationId || null,
        })
      }
    })

    authApi
      .fetchCurrentPrincipal()
      .then((me) => {
        if (!active) return
        if (me && me.accountId) {
          setPrincipal(me)
          setStatus(me.status === 'ACTIVE' ? 'authenticated' : 'locked')
        } else {
          setPrincipal(null)
          setStatus('unauthenticated')
        }
      })
      .catch((err) => {
        if (!active) return
        if (err?.code === 'ACCOUNT_LOCKED') {
          setPrincipal(null)
          setStatus('locked')
          setLockedError(err)
        } else {
          setPrincipal(null)
          setStatus('unauthenticated')
          setSessionNotice(null)
        }
      })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const login = useCallback(async ({ loginName, password }) => {
    setLockedError(null)
    setSessionNotice(null)
    try {
      const session = await authApi.login({ loginName, password })
      const resolvedPrincipal = session?.principal || null
      setPrincipal(resolvedPrincipal)
      setStatus('authenticated')
      return session
    } catch (err) {
      if (err?.code === 'ACCOUNT_LOCKED') {
        setPrincipal(null)
        setStatus('locked')
        setLockedError(err)
      }
      throw err
    }
  }, [])

  const registerPatient = useCallback(async (payload, options = {}) => {
    const created = await authApi.registerPatient(payload, options)
    setSessionNotice({
      tone: 'success',
      title: 'Đăng ký hồ sơ thành công',
      message: `Hồ sơ bệnh nhân ${created.profileCode} (${created.fullName}) đã sẵn sàng. Vui lòng đăng nhập để sử dụng dịch vụ.`,
    })
    return created
  }, [])

  const logout = useCallback(async (noticeMessage = null) => {
    try {
      await authApi.logout()
    } finally {
      setPrincipal(null)
      setLockedError(null)
      setStatus('unauthenticated')
      setSessionNotice(
        noticeMessage
          ? {
              tone: 'neutral',
              title: 'Đã đăng xuất',
              message: noticeMessage,
            }
          : null
      )
    }
  }, [])

  const refreshSession = useCallback(async () => {
    const me = await authApi.fetchCurrentPrincipal()
    setPrincipal(me)
    setStatus(me?.status === 'ACTIVE' ? 'authenticated' : 'locked')
    return me
  }, [])

  const updateProfile = useCallback(async (payload) => {
    const updated = await authApi.updateOwnProfile(payload)
    setPrincipal(updated)
    return updated
  }, [])

  const clearSessionNotice = useCallback(() => {
    setSessionNotice(null)
  }, [])

  const value = useMemo(
    () => ({
      status,
      principal,
      sessionNotice,
      lockedError,
      login,
      registerPatient,
      logout,
      refreshSession,
      updateProfile,
      clearSessionNotice,
    }),
    [
      status,
      principal,
      sessionNotice,
      lockedError,
      login,
      registerPatient,
      logout,
      refreshSession,
      updateProfile,
      clearSessionNotice,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
