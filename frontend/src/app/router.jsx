import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { RouterContext } from '@/app/routerContext'
import { matchRoutePath, normalizeRoutePath } from '@/lib/routeUtils'

export function RouterProvider({ children }) {
  const [path, setPath] = useState(() =>
    typeof window !== 'undefined' ? normalizeRoutePath(window.location.pathname) : '/'
  )
  const [routeState, setRouteState] = useState(null)

  useEffect(() => {
    const handlePopState = (event) => {
      setPath(normalizeRoutePath(window.location.pathname))
      setRouteState(event.state || null)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((nextPath, options = {}) => {
    const normalized = normalizeRoutePath(nextPath)
    const nextState = options.state || null
    if (typeof window !== 'undefined') {
      if (options.replace) {
        window.history.replaceState(nextState, '', normalized)
      } else if (normalizeRoutePath(window.location.pathname) !== normalized) {
        window.history.pushState(nextState, '', normalized)
      }
    }
    setRouteState(nextState)
    setPath(normalized)
  }, [])

  const value = useMemo(() => ({ path, routeState, navigate }), [path, routeState, navigate])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function RouteLink({ to, state = null, className = '', children, ...rest }) {
  const { path, navigate } = useContext(RouterContext)
  const target = normalizeRoutePath(to)
  const isActive = path === target

  const handleClick = (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return
    }
    event.preventDefault()
    navigate(target, { state })
  }

  return (
    <a
      href={target}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      className={className}
      {...rest}
    >
      {children}
    </a>
  )
}

export function RouteView({ routes }) {
  const { path } = useContext(RouterContext)
  const matched = matchRoutePath(routes, path)
  if (!matched || !matched.element) {
    return null
  }
  return matched.element
}
