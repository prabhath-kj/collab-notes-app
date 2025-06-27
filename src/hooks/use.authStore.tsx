import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  isAuthenticated: boolean
  token: string | null
  hasHydrated: boolean
  setAuthenticated: (val: boolean, token?: string) => void
  logout: () => void
  setHasHydrated: (val: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      hasHydrated: false,

      setAuthenticated: (val, token) =>
        set({
          isAuthenticated: val,
          token: token || null,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
        }),

      setHasHydrated: (val) => set({ hasHydrated: val }),
    }),
    {
      name: 'auth-store',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
