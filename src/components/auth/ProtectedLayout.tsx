'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/hooks/use.authStore'

interface Props {
  children: React.ReactNode
}

export default function ProtectedLayout({ children }: Props) {
  const router = useRouter()
  const token = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!token) {
      router.push('/sign-in') 
    }
  }, [token, router])

  return <>{children}</>
}
