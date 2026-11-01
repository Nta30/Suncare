import { createContext, useContext } from 'react'

export const RouterContext = createContext({
  path: '/',
  routeState: null,
  navigate: () => {},
})

export function useRouter() {
  return useContext(RouterContext)
}

