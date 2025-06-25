import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  isAuthenticated: boolean
  token: string | null
  setAuthenticated: (val: boolean, token?: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,

      setAuthenticated: (val, token) => set({
        isAuthenticated: val,
        token: token || null,
      }),

      logout: () => set({
        isAuthenticated: false,
        token: null,
      }),
    }),
    {
      name: 'auth-store', 
    }
  )
)
