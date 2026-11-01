import { createContext, useContext } from 'react'

export const AuthContext = createContext({
  status: 'initializing',
  principal: null,
  sessionNotice: null,
  lockedError: null,
  login: async () => {},
  registerPatient: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
  updateProfile: async () => {},
  clearSessionNotice: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

