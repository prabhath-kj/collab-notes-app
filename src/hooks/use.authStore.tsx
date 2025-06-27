import { IUser } from '@/lib/db/models/user.model'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  isAuthenticated: boolean
  user: IUser | null
  token: string | null
  hasHydrated: boolean
  setAuthenticated: (val: boolean, token?: string, user?: IUser) => void
  logout: () => void
  setHasHydrated: (val: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      hasHydrated: false,
      user: null,

      setAuthenticated: (val, token, user) =>
        set({
          isAuthenticated: val,
          token: token || null,
          user: user
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
          user: null
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
