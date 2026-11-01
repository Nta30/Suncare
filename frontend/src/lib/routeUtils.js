export function normalizeRoutePath(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') {
    return '/'
  }
  const withoutQuery = rawPath.split('?')[0].split('#')[0].trim()
  if (!withoutQuery || withoutQuery === '/') {
    return '/'
  }
  const leading = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`
  return leading.length > 1 && leading.endsWith('/') ? leading.slice(0, -1) : leading
}

export function matchRoutePath(routes, currentPath) {
  const normalized = normalizeRoutePath(currentPath)
  const exact = routes.find((route) => normalizeRoutePath(route.path) === normalized)
  if (exact) {
    return exact
  }
  return routes.find((route) => route.path === '*') || null
}

