'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/hooks/use.authStore'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const hasHydrated = useAuthStore((state) => state.hasHydrated)

    useEffect(() => {
        if (hasHydrated && !isAuthenticated) {
            router.replace('/sign-in')
        }
    }, [hasHydrated, isAuthenticated, router])

    if (!hasHydrated) {
        return null
    }

    return <>{children}</>
}
