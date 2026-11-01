import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { matchRoutePath, normalizeRoutePath } from '@/lib/routeUtils'

const RouterContext = createContext({
  path: '/',
  navigate: () => {},
})

export function RouterProvider({ children }) {
  const [path, setPath] = useState(() =>
    typeof window !== 'undefined' ? normalizeRoutePath(window.location.pathname) : '/'
  )

  useEffect(() => {
    const handlePopState = () => {
      setPath(normalizeRoutePath(window.location.pathname))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((nextPath) => {
    const normalized = normalizeRoutePath(nextPath)
    if (typeof window !== 'undefined' && normalizeRoutePath(window.location.pathname) !== normalized) {
      window.history.pushState({}, '', normalized)
    }
    setPath(normalized)
  }, [])

  const value = useMemo(() => ({ path, navigate }), [path, navigate])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function RouteLink({ to, className = '', children }) {
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
    navigate(target)
  }

  return (
    <a
      href={target}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      className={className}
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

