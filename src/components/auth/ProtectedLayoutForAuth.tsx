'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/hooks/use.authStore'

interface Props {
  children: React.ReactNode
}

export default function ProtectedLayout({ children }: Props) {
  const router = useRouter()
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace('/notes')
    }
  }, [hasHydrated, isAuthenticated, router])

  return <>{children}</>
}
